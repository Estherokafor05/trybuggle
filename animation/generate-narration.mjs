// Generates lesson narration with the user's own ElevenLabs voice.
// Usage: node generate-narration.mjs <script.json> <output-dir>
// Reads ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID from ../.env.local.
// Never prints either value. Writes one MP3 plus character timings per scene.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [scriptPath, outDir] = process.argv.slice(2);
if (!scriptPath || !outDir) throw new Error("Usage: node generate-narration.mjs <script.json> <output-dir>");

const env = Object.fromEntries(
  (await readFile(path.resolve(here, "../.env.local"), "utf8"))
    .split("\n")
    .map((line) => line.match(/^\s*(ELEVENLABS_[A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
);
const key = env.ELEVENLABS_API_KEY;
const voice = env.ELEVENLABS_VOICE_ID;
if (!key || !voice) throw new Error("ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is missing from .env.local");

const script = JSON.parse(await readFile(path.resolve(scriptPath), "utf8"));
const only = process.env.SCENE;
await mkdir(outDir, { recursive: true });
const texts = script.scenes.map((s) => s.lines.join(" "));

for (const [i, scene] of script.scenes.entries()) {
  if (only && scene.id !== only) continue;
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text: texts[i],
        model_id: "eleven_multilingual_v2",
        previous_text: texts[i - 1],
        next_text: texts[i + 1],
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs returned ${response.status} for ${scene.id}: ${(await response.text()).slice(0, 300)}`);
  }
  const data = await response.json();
  await writeFile(path.join(outDir, `${scene.id}.mp3`), Buffer.from(data.audio_base64, "base64"));
  await writeFile(path.join(outDir, `${scene.id}.alignment.json`), JSON.stringify({ text: texts[i], alignment: data.alignment }));
  console.log(`Generated ${scene.id}`);
}
