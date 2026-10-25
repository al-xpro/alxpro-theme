import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { palettes } from "../src/palette.ts";
import { vscodeTheme } from "../src/formats/vscode.ts";
import { terminalFormats } from "../src/formats/terminals.ts";
import { bannerSvg } from "../src/banner.ts";

/*
 * Writes every theme in `themes/` from `src/palette.ts`. The folder is wiped
 * first, so a format that's removed from the source disappears here too, and
 * the output is byte-for-byte the same on every run: CI builds and then fails
 * on any difference from what's committed.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "themes");

rmSync(out, { recursive: true, force: true });

const written: string[] = [];
function write(folder: string, name: string, contents: string) {
  const file = join(out, folder, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
  written.push(relative(root, file));
}

/* The walkthrough's banner ships with the VS Code themes. */
write("vscode", "welcome.svg", bannerSvg());

for (const palette of palettes) {
  write("vscode", `${palette.slug}.json`, `${JSON.stringify(vscodeTheme(palette), null, 2)}\n`);
  for (const [folder, format] of Object.entries(terminalFormats)) {
    const [name, contents] = format(palette);
    write(folder, name, contents);
  }
}

console.log(`Wrote ${written.length} files:\n${written.map((file) => `  ${file}`).join("\n")}`);
