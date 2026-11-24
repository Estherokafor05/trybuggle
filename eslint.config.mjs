import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Platform code reaches the course only through its entry points.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@course/(?!(ui|assessments)$)",
              message:
                "Import course data from \"@course\", course screens from \"@course/ui\", or questions from \"@course/assessments\".",
            },
            {
              group: ["**/courses/**"],
              message: "Use the @course entry points instead of a path into courses/.",
            },
          ],
        },
      ],
    },
  },
  // Courses use the platform's building blocks, never its pages or routes.
  {
    files: ["courses/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/app/*", "@/app"], message: "Courses must not depend on platform pages or routes." }] },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "animation/**"]),
]);
