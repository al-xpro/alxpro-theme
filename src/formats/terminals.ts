import { readFileSync } from "node:fs";
import type { Hex, Palette } from "../palette.ts";

/*
 * A palette's terminal colors in every terminal's own format. Each function
 * returns `[file name, contents]`; `scripts/build.ts` decides the folder.
 *
 * Most formats take opaque colors only, so the selection, which carries
 * alpha, is blended onto the background for them. Terminal.app and iTerm2
 * keep the alpha.
 */

const ANSI = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"] as const;

function rgb(hex: Hex) {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(1), g: n(3), b: n(5), a: hex.length === 9 ? n(7) / 255 : 1 };
}

/** `#RRGGBBAA` laid over the background, as `#rrggbb`. */
function opaque(hex: Hex, background: Hex): Hex {
  const c = rgb(hex);
  const b = rgb(background);
  const mix = (x: number, y: number) => Math.round(x * c.a + y * (1 - c.a));
  const out = [mix(c.r, b.r), mix(c.g, b.g), mix(c.b, b.b)];
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const lower = (hex: Hex) => hex.slice(0, 7).toLowerCase();

/** Named colors every format needs, opaque. */
function colors(p: Palette) {
  const t = p.terminal;
  return {
    background: lower(t.background),
    foreground: lower(t.foreground),
    cursor: lower(t.cursor),
    selection: lower(opaque(t.selection, t.background)),
    normal: t.ansi.slice(0, 8).map(lower),
    bright: t.ansi.slice(8).map(lower),
  };
}

/* ---------- Ghostty ---------- */

export function ghostty(p: Palette): [string, string] {
  const c = colors(p);
  const lines = [
    ...p.terminal.ansi.map((hex, i) => `palette = ${i}=${lower(hex)}`),
    `background = ${c.background}`,
    `foreground = ${c.foreground}`,
    `cursor-color = ${c.cursor}`,
    `cursor-text = ${c.background}`,
    `selection-background = ${c.selection}`,
  ];
  return [p.name, `${lines.join("\n")}\n`];
}

/* ---------- Warp ---------- */

export function warp(p: Palette): [string, string] {
  const c = colors(p);
  const block = (list: string[]) => ANSI.map((name, i) => `    ${name}: "${list[i]}"`).join("\n");
  return [
    `${p.slug.replace("-", "_")}.yaml`,
    [
      `name: ${p.name}`,
      `accent: "${lower(p.ui.accent)}"`,
      `cursor: "${c.cursor}"`,
      `background: "${c.background}"`,
      `foreground: "${c.foreground}"`,
      `details: ${p.type === "dark" ? "darker" : "lighter"}`,
      "terminal_colors:",
      "  normal:",
      block(c.normal),
      "  bright:",
      block(c.bright),
      "",
    ].join("\n"),
  ];
}

/* ---------- Windows Terminal ---------- */

export function windowsTerminal(p: Palette): [string, string] {
  const c = colors(p);
  /* Windows Terminal calls magenta "purple". */
  const names = ANSI.map((name) => (name === "magenta" ? "purple" : name));
  const scheme = {
    name: p.name,
    background: c.background,
    foreground: c.foreground,
    cursorColor: c.cursor,
    selectionBackground: c.selection,
    ...Object.fromEntries(names.map((name, i) => [name, c.normal[i]])),
    ...Object.fromEntries(
      names.map((name, i) => [`bright${name[0].toUpperCase()}${name.slice(1)}`, c.bright[i]])
    ),
  };
  return [`${p.slug}.json`, `${JSON.stringify(scheme, null, 2)}\n`];
}

/* ---------- Alacritty ---------- */

export function alacritty(p: Palette): [string, string] {
  const c = colors(p);
  const block = (list: string[]) => ANSI.map((name, i) => `${name} = "${list[i]}"`).join("\n");
  return [
    `${p.slug}.toml`,
    [
      `# ${p.name}`,
      "[colors.primary]",
      `background = "${c.background}"`,
      `foreground = "${c.foreground}"`,
      "",
      "[colors.cursor]",
      `cursor = "${c.cursor}"`,
      `text = "${c.background}"`,
      "",
      "[colors.selection]",
      `background = "${c.selection}"`,
      `text = "CellForeground"`,
      "",
      "[colors.normal]",
      block(c.normal),
      "",
      "[colors.bright]",
      block(c.bright),
      "",
    ].join("\n"),
  ];
}

/* ---------- Kitty ---------- */

export function kitty(p: Palette): [string, string] {
  const c = colors(p);
  return [
    `${p.slug}.conf`,
    [
      `# ${p.name}`,
      `background ${c.background}`,
      `foreground ${c.foreground}`,
      `cursor ${c.cursor}`,
      `cursor_text_color ${c.background}`,
      `selection_background ${c.selection}`,
      "selection_foreground none",
      `url_color ${lower(p.ui.accent)}`,
      ...p.terminal.ansi.map((hex, i) => `color${i} ${lower(hex)}`),
      "",
    ].join("\n"),
  ];
}

/* ---------- WezTerm ---------- */

export function wezterm(p: Palette): [string, string] {
  const c = colors(p);
  const list = (values: string[]) => `[${values.map((v) => `"${v}"`).join(", ")}]`;
  return [
    `${p.name}.toml`,
    [
      "[colors]",
      `background = "${c.background}"`,
      `foreground = "${c.foreground}"`,
      `cursor_bg = "${c.cursor}"`,
      `cursor_border = "${c.cursor}"`,
      `cursor_fg = "${c.background}"`,
      `selection_bg = "${c.selection}"`,
      `ansi = ${list(c.normal)}`,
      `brights = ${list(c.bright)}`,
      "",
      "[metadata]",
      `name = "${p.name}"`,
      "",
    ].join("\n"),
  ];
}

/* ---------- iTerm2 ---------- */

const plist = (body: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    body,
    "</plist>",
    "",
  ].join("\n");

/** Up to ten decimals, without trailing zeros, as Apple writes them. */
const decimal = (value: number) => String(Number(value.toFixed(10)));

export function iterm2(p: Palette): [string, string] {
  const t = p.terminal;
  const entry = (key: string, hex: Hex) => {
    const { r, g, b, a } = rgb(hex);
    return [
      `\t<key>${key}</key>`,
      "\t<dict>",
      `\t\t<key>Alpha Component</key>\n\t\t<real>${decimal(a)}</real>`,
      `\t\t<key>Blue Component</key>\n\t\t<real>${decimal(b / 255)}</real>`,
      "\t\t<key>Color Space</key>\n\t\t<string>sRGB</string>",
      `\t\t<key>Green Component</key>\n\t\t<real>${decimal(g / 255)}</real>`,
      `\t\t<key>Red Component</key>\n\t\t<real>${decimal(r / 255)}</real>`,
      "\t</dict>",
    ].join("\n");
  };
  const entries: [string, Hex][] = [
    ...t.ansi.map((hex, i): [string, Hex] => [`Ansi ${i} Color`, hex]),
    ["Background Color", t.background],
    ["Badge Color", `${p.ui.accent.slice(0, 7)}80` as Hex],
    ["Bold Color", t.foreground],
    ["Cursor Color", t.cursor],
    ["Cursor Guide Color", `${p.ui.accent.slice(0, 7)}40` as Hex],
    ["Cursor Text Color", t.background],
    ["Foreground Color", t.foreground],
    ["Link Color", p.ui.accent],
    ["Selected Text Color", t.foreground],
    ["Selection Color", opaque(t.selection, t.background)],
  ];
  /* Keys sorted the way iTerm2 exports them, so a re-export diffs cleanly. */
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return [`${p.name}.itermcolors`, plist(`<dict>\n${entries.map(([k, v]) => entry(k, v)).join("\n")}\n</dict>`)];
}

/* ---------- Terminal.app ---------- */

/*
 * Terminal.app stores each color as an `NSColor` archived by
 * `NSKeyedArchiver`, inside the profile's plist. The archive here is the one
 * Terminal itself writes for an sRGB color — the components, plus the sRGB
 * ICC profile they're in — written as an XML plist rather than a binary one,
 * which `NSKeyedUnarchiver` reads the same. `scripts/check.ts` proves it on
 * macOS by unarchiving every color with AppKit.
 */

const ICC = readFileSync(new URL("./srgb.icc", import.meta.url)).toString("base64");
const uid = (n: number) => `<dict><key>CF$UID</key><integer>${n}</integer></dict>`;
const data = (text: string) => `<data>${Buffer.from(text, "latin1").toString("base64")}</data>`;

function archivedColor(hex: Hex): string {
  const { r, g, b, a } = rgb(hex);
  const parts = [r / 255, g / 255, b / 255].map(decimal);
  const withAlpha = [...parts, decimal(a)].join(" ");
  const xml = plist(
    [
      "<dict>",
      "<key>$archiver</key><string>NSKeyedArchiver</string>",
      "<key>$objects</key><array>",
      "<string>$null</string>",
      `<dict><key>$class</key>${uid(5)}<key>NSColorSpace</key><integer>1</integer>` +
        `<key>NSComponents</key>${data(withAlpha)}<key>NSCustomColorSpace</key>${uid(2)}` +
        `<key>NSLinearExposure</key>${data("1")}` +
        `<key>NSRGB</key>${data(`${a === 1 ? parts.join(" ") : withAlpha}\0`)}</dict>`,
      `<dict><key>$class</key>${uid(4)}<key>NSICC</key>${uid(3)}<key>NSID</key><integer>7</integer></dict>`,
      `<data>${ICC}</data>`,
      "<dict><key>$classes</key><array><string>NSColorSpace</string><string>NSObject</string></array><key>$classname</key><string>NSColorSpace</string></dict>",
      "<dict><key>$classes</key><array><string>NSColor</string><string>NSObject</string></array><key>$classname</key><string>NSColor</string></dict>",
      "</array>",
      `<key>$top</key><dict><key>root</key>${uid(1)}</dict>`,
      "<key>$version</key><integer>100000</integer>",
      "</dict>",
    ].join("\n")
  );
  return Buffer.from(xml).toString("base64");
}

/** Base64 wrapped at 68 columns and indented, as Apple's plists are. */
const wrapped = (base64: string) => base64.match(/.{1,68}/g)!.map((line) => `\t${line}`).join("\n");

export function terminalApp(p: Palette): [string, string] {
  const t = p.terminal;
  const names = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
  const colorsByKey: [string, Hex][] = [
    ...t.ansi.map((hex, i): [string, Hex] => [`ANSI${i < 8 ? "" : "Bright"}${names[i % 8]}Color`, hex]),
    ["BackgroundColor", t.background],
    ["CursorColor", t.cursor],
    ["SelectionColor", t.selection],
    ["TextBoldColor", t.foreground],
    ["TextColor", t.foreground],
  ];
  colorsByKey.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const body = [
    "<dict>",
    ...colorsByKey.map(([key, hex]) => `\t<key>${key}</key>\n\t<data>\n${wrapped(archivedColor(hex))}\n\t</data>`),
    "\t<key>ProfileCurrentVersion</key>\n\t<real>2.07</real>",
    `\t<key>name</key>\n\t<string>${p.name}</string>`,
    "\t<key>type</key>\n\t<string>Window Settings</string>",
    "</dict>",
  ].join("\n");
  return [`${p.name}.terminal`, plist(body)];
}

export const terminalFormats = {
  "terminal-app": terminalApp,
  iterm2,
  ghostty,
  warp,
  "windows-terminal": windowsTerminal,
  alacritty,
  kitty,
  wezterm,
} as const;
