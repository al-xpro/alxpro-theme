import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { palettes, type Hex, type Palette } from "../src/palette.ts";
import { banner } from "../src/banner.ts";

/*
 * Checks the themes say what the palette means them to:
 *
 * - every color that draws text keeps WCAG AA (4.5:1) against its background;
 * - a terminal badge — a word printed on a colored background, like Jest's
 *   PASS — is readable in the background's own color, which is what such a
 *   badge's text becomes when it's printed in inverse video;
 * - the generated files parse, and on macOS every Terminal.app color
 *   unarchives with AppKit to exactly the palette's value.
 *
 * Exits non-zero on the first theme that fails anything, after listing it all.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const AA = 4.5;

function luminance(hex: Hex) {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrast(a: Hex, b: Hex) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const ANSI = [
  "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
  "brightBlack", "brightRed", "brightGreen", "brightYellow",
  "brightBlue", "brightMagenta", "brightCyan", "brightWhite",
];

/** The ANSI colors that sit near the background by convention, so aren't text. */
const nearBackground = (p: Palette) => (p.type === "dark" ? [0] : [7, 15]);

const failures: string[] = [];
function expect(ok: boolean, message: string) {
  if (!ok) failures.push(message);
}

for (const p of palettes) {
  const { syntax, terminal, ui } = p;

  for (const [role, color] of Object.entries(syntax)) {
    const ratio = contrast(color, ui.background);
    expect(ratio >= AA, `${p.name}: syntax.${role} ${color} is ${ratio.toFixed(2)}:1 on ${ui.background}`);
  }

  const ratio = contrast(terminal.foreground, terminal.background);
  expect(ratio >= AA, `${p.name}: terminal foreground is ${ratio.toFixed(2)}:1`);
  terminal.ansi.forEach((color, i) => {
    if (nearBackground(p).includes(i)) return;
    const text = contrast(color, terminal.background);
    expect(text >= AA, `${p.name}: ${ANSI[i]} ${color} is ${text.toFixed(2)}:1 on ${terminal.background}`);
  });
  /* Badges: black text in the dark theme, white in the light one. */
  terminal.ansi.slice(1, 7).forEach((color, i) => {
    const badge = contrast(terminal.background, color);
    expect(badge >= AA, `${p.name}: badge text on ${ANSI[i + 1]} ${color} is ${badge.toFixed(2)}:1`);
  });

  const pairs: [string, Hex, Hex][] = [
    ["ui.text", ui.text, ui.background],
    ["ui.muted", ui.muted, ui.background],
    ["ui.muted on surface", ui.muted, ui.surface],
    ["ui.accent (links)", ui.accent, ui.background],
    ["ui.error", ui.error, ui.background],
    ["ui.warning", ui.warning, ui.background],
    ["ui.onAccent on accent", ui.onAccent, ui.accent],
    ["ui.onButton on button", ui.onButton, ui.button],
    ["ui.strong on active row", ui.strong, ui.active],
    ["debugging status bar", ui.background, ui.warning],
  ];
  for (const [name, fg, bg] of pairs) {
    const r = contrast(fg, bg);
    expect(r >= AA, `${p.name}: ${name} is ${r.toFixed(2)}:1`);
  }

  /* The generated files parse, and the VS Code theme is this palette's. */
  const theme = JSON.parse(readFileSync(join(root, "themes/vscode", `${p.slug}.json`), "utf8"));
  expect(theme.colors["editor.background"] === ui.background, `${p.name}: themes/ is stale, run npm run build`);
  JSON.parse(readFileSync(join(root, "themes/windows-terminal", `${p.slug}.json`), "utf8"));

  if (process.platform === "darwin") {
    const file = join(root, "themes/terminal-app", `${p.name}.terminal`);
    const output = execFileSync("swift", [join(root, "scripts/verify-terminal-app.swift"), file], {
      encoding: "utf8",
    });
    const read = new Map(output.trim().split("\n").map((line) => line.split(" ") as [string, string]));
    const names = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
    const expected: [string, Hex][] = [
      ...terminal.ansi.map((hex, i): [string, Hex] => [`ANSI${i < 8 ? "" : "Bright"}${names[i % 8]}Color`, hex]),
      ["BackgroundColor", terminal.background],
      ["TextColor", terminal.foreground],
      ["CursorColor", terminal.cursor],
      ["SelectionColor", terminal.selection],
    ];
    for (const [key, hex] of expected) {
      expect(read.get(key) === hex.toUpperCase(), `${p.name}: Terminal.app ${key} reads back as ${read.get(key)}, not ${hex}`);
    }
  }
}

/* install.sh runs alone through `curl | bash`, so it carries its own copy of the banner. */
const installer = readFileSync(join(root, "install.sh"), "utf8");
for (const line of [...banner.alxpro, ...banner.theme]) {
  expect(installer.includes(`"${line}"`), `install.sh's banner differs from src/banner.ts at: ${line.trim()}`);
}

if (failures.length) {
  console.error(`✖ ${failures.length} problem(s):\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(
  `✓ Contrast, badges and generated files check out${process.platform === "darwin" ? ", Terminal.app colors read back exactly" : ""}.`
);
