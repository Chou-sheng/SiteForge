import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import autoprefixer from "autoprefixer";
import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const projectRoot = process.cwd();
const outputDirectory = join(projectRoot, "public", "static-runtime");
const scriptOutput = join(outputDirectory, "renderer.js");
const styleOutput = join(outputDirectory, "style.css");

await mkdir(outputDirectory, { recursive: true });

await build({
  entryPoints: [join(projectRoot, "src", "static-site", "client.tsx")],
  outfile: scriptOutput,
  bundle: true,
  format: "iife",
  jsx: "automatic",
  platform: "browser",
  target: ["chrome109", "edge109", "firefox115", "safari16"],
  minify: true,
  legalComments: "none",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

const inputCss = await readFile(
  join(projectRoot, "src", "app", "globals.css"),
  "utf8",
);
const cssResult = await postcss([
  tailwindcss({
    content: [join(projectRoot, "src", "**", "*.{ts,tsx}")],
    theme: {
      extend: {
        fontFamily: {
          sans: [
            "Inter",
            "ui-sans-serif",
            "system-ui",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "sans-serif",
          ],
        },
      },
    },
    plugins: [],
  }),
  autoprefixer,
]).process(inputCss, {
  from: join(projectRoot, "src", "app", "globals.css"),
  to: styleOutput,
});

await writeFile(styleOutput, cssResult.css, "utf8");
console.log("Static PageRenderer runtime built in public/static-runtime");
