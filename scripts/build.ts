import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dark, light, palettes } from "../src/palette.ts";
import { vscodeTheme } from "../src/formats/vscode.ts";
import { terminalFormats } from "../src/formats/terminals.ts";
import { bannerSvg } from "../src/banner.ts";
import { css, indexDts, indexJs, packageJson, shikiTheme } from "../src/formats/npm.ts";

/*
 * Writes every theme in `themes/`, and the npm package in `npm/`, from
 * `src/palette.ts`. Generated folders are wiped first, so a format that's
 * removed from the source disappears here too, and the output is
 * byte-for-byte the same on every run: CI builds and then fails on any
 * difference from what's committed.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "themes");

rmSync(out, { recursive: true, force: true });

const written: string[] = [];
function write(folder: string, name: string, contents: string, base = out) {
  const file = join(base, folder, name);
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

/* The npm package: its own folder, with the extension's version. */
const pkg = join(root, "npm");
rmSync(join(pkg, "dist"), { recursive: true, force: true });
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
write("", "package.json", packageJson(version), pkg);
write("dist", "index.js", indexJs(dark, light), pkg);
write("dist", "index.d.ts", indexDts(dark), pkg);
write("dist", "alxpro.css", css(dark, light), pkg);
for (const palette of palettes) {
  write("dist/themes", `${palette.slug}.json`, `${JSON.stringify(shikiTheme(palette), null, 2)}\n`, pkg);
}
copyFileSync(join(root, "LICENSE"), join(pkg, "LICENSE"));

console.log(`Wrote ${written.length} files:\n${written.map((file) => `  ${file}`).join("\n")}`);
