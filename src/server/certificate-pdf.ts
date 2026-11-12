// Builds the Certificate of Completion as an A4 landscape PDF.
// Fonts are bundled (Inter, SIL Open Font License) so any learner's name in a
// supported script prints correctly. See next.config.ts for file tracing.
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

const fontDir = path.join(process.cwd(), "src/server/fonts");
let fonts: Promise<{ regular: Uint8Array; bold: Uint8Array }> | undefined;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(path.join(fontDir, "Inter-Regular.ttf")),
    readFile(path.join(fontDir, "Inter-Bold.ttf")),
  ]).then(([regular, bold]) => ({ regular, bold }));
  return fonts;
}

/** Characters the certificate font cannot draw, so names never print as empty boxes. */
export async function unprintableCharacters(name: string) {
  const { bold } = await loadFonts();
  const font = fontkit.create(bold);
  return [...new Set([...name].filter((ch) => ch.trim() && !font.hasGlyphForCodePoint(ch.codePointAt(0)!)))];
}

export type CertificateDetails = {
  learnerName: string;
  moduleTitle: string;
  completedOn: Date;
  code: string;
};

const navy = rgb(0x17 / 255, 0x24 / 255, 0x3c / 255);
const violet = rgb(0x71 / 255, 0x55 / 255, 0xd9 / 255);
const teal = rgb(0x08 / 255, 0x7f / 255, 0x72 / 255);
const muted = rgb(0x55 / 255, 0x60 / 255, 0x7a / 255);
const lavender = rgb(0xef / 255, 0xea / 255, 0xfc / 255);

function centred(page: ReturnType<PDFDocument["addPage"]>, text: string, y: number, font: PDFFont, size: number, color = navy, maxWidth = 680) {
  let s = size;
  while (font.widthOfTextAtSize(text, s) > maxWidth && s > 12) s -= 1;
  const width = font.widthOfTextAtSize(text, s);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size: s, font, color });
}

export async function certificatePdf(details: CertificateDetails) {
  const { regular, bold } = await loadFonts();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${details.moduleTitle}, Certificate of Completion`);
  pdf.setAuthor("Buggle Learn");
  pdf.setSubject(`Certificate ${details.code}`);
  pdf.setCreator("Buggle Learn");
  const body = await pdf.embedFont(regular, { subset: true });
  const heavy = await pdf.embedFont(bold, { subset: true });

  const page = pdf.addPage([841.89, 595.28]); // A4 landscape, points
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: violet, borderWidth: 3 });
  page.drawRectangle({ x: 34, y: 34, width: width - 68, height: height - 68, borderColor: lavender, borderWidth: 1.5 });
  page.drawRectangle({ x: 34, y: height - 120, width: width - 68, height: 86, color: lavender });

  // Brand mark: an open book in a rounded square, matching the site logo.
  page.drawRectangle({ x: width / 2 - 22, y: height - 98, width: 44, height: 44, color: navy });
  page.drawRectangle({ x: width / 2 - 13, y: height - 86, width: 12, height: 20, color: rgb(0.86, 0.82, 0.98) });
  page.drawRectangle({ x: width / 2 + 1, y: height - 86, width: 12, height: 20, color: rgb(0.98, 0.66, 0.78) });
  centred(page, "BUGGLE LEARN", height - 152, heavy, 13, violet);

  centred(page, "Certificate of Completion", height - 210, heavy, 40, navy);
  centred(page, "This certifies that", height - 252, body, 15, muted);
  centred(page, details.learnerName, height - 304, heavy, 36, navy);
  page.drawLine({ start: { x: width / 2 - 190, y: height - 318 }, end: { x: width / 2 + 190, y: height - 318 }, thickness: 1.2, color: violet });
  centred(page, "has completed", height - 350, body, 15, muted);
  centred(page, details.moduleTitle, height - 384, heavy, 24, teal);

  const date = details.completedOn.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const columns: [string, string, number][] = [
    ["Completed on", date, width * 0.25],
    ["Issued by", "Buggle Learn", width * 0.5],
    ["Certificate ID", details.code, width * 0.75],
  ];
  for (const [label, value, x] of columns) {
    page.drawText(label, { x: x - body.widthOfTextAtSize(label, 10) / 2, y: 128, size: 10, font: body, color: muted });
    page.drawText(value, { x: x - heavy.widthOfTextAtSize(value, 14) / 2, y: 108, size: 14, font: heavy, color: navy });
  }
  centred(
    page,
    "This is a certificate of completion. It is not an accredited qualification or proof of professional competence.",
    62,
    body,
    9.5,
    muted,
  );
  return pdf.save();
}
