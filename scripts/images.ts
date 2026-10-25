import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { dark, light } from "../src/palette.ts";
import { serve } from "./serve.ts";

/*
 * Renders every image the README and the marketplaces use, from the preview
 * page and the palette, so they're re-made in seconds when a color changes:
 * `npm run images`. Uses the Chrome you have installed, or Playwright's own
 * Chromium after `npx playwright install chromium`.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "images");
const PORT = 4322;
const base = `http://localhost:${PORT}/preview/`;

/** Code and terminal blocks, dark and light side by side, at 2x. */
const SHOTS: [file: string, query: string][] = [
  ["hero.png", "shot=react-component.tsx&lines=17-45"],
  ["css.png", "shot=globals.css&lines=13-41"],
  ["shell.png", "shot=commands.sh&lines=3-21"],
  ["markdown.png", "shot=article.md"],
  ["terminal.png", "shot=terminal:tests"],
  ["terminal-commands.png", "shot=terminal:commands"],
];

async function shoot(page: Page, query: string, file: string, width = 1600) {
  await page.goto(`${base}?${query}&mode=both&width=${width}`);
  await page.waitForSelector("html[data-ready]");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".row").screenshot({ path: join(out, file), omitBackground: true });
}

/* The icon: lines of code in the palette's accents, and a cursor. No logo of anyone's. */
const icon = (size: number) => {
  const s = dark.syntax;
  const bar = (color: string, width: number) =>
    `<i style="width:${width}px;background:${color}"></i>`;
  return `<!doctype html><style>
    body { margin: 0; background: transparent; }
    .icon { width: ${size}px; height: ${size}px; box-sizing: border-box; border-radius: 56px;
      background: ${dark.ui.background}; border: 2px solid ${dark.ui.borderStrong};
      display: flex; flex-direction: column; justify-content: center; gap: 22px; padding: 0 44px; }
    .row { display: flex; gap: 14px; }
    .row.indent { padding-left: 34px; }
    i { display: block; height: 20px; border-radius: 10px; }
    i.cursor { width: 12px; border-radius: 3px; height: 34px; margin-top: -7px; }
  </style><div class="icon">
    <div class="row">${bar(s.keyword, 48)}${bar(s.foreground, 104)}</div>
    <div class="row indent">${bar(s.property, 64)}${bar(s.string, 70)}</div>
    <div class="row indent">${bar(s.function, 82)}${bar(s.constant, 40)}</div>
    <div class="row">${bar(s.foreground, 30)}<i class="cursor" style="background:${s.foreground}"></i></div>
  </div>`;
};

/* GitHub's social preview: 1280×640, the name, and the code in both themes. */
const social = () => `<!doctype html>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap" />
  <style>
    body { margin: 0; width: 1280px; height: 640px; overflow: hidden; background: ${dark.ui.background};
      color: ${dark.ui.text}; font-family: Geist, system-ui, sans-serif; position: relative; }
    .copy { position: absolute; left: 72px; top: 72px; width: 520px; }
    h1 { margin: 0 0 16px; font-size: 64px; font-weight: 600; letter-spacing: -0.04em; }
    p { margin: 0; color: ${dark.ui.muted}; font-size: 24px; line-height: 1.4; }
    .dots { display: flex; gap: 10px; margin-top: 40px; }
    .dots i { width: 22px; height: 22px; border-radius: 50%; }
    iframe { position: absolute; border: 0; left: 640px; top: 40px; width: 1700px; height: 760px;
      transform: scale(0.62); transform-origin: 0 0; }
  </style>
  <div class="copy">
    <h1>AlxPro Theme</h1>
    <p>Black-and-white dark and light themes for web development. VS Code, Cursor and eight terminals.</p>
    <div class="dots">${[dark.syntax.keyword, dark.syntax.property, dark.syntax.string, dark.syntax.constant, dark.syntax.function, light.syntax.keyword, light.syntax.property, light.syntax.string, light.syntax.constant, light.syntax.function]
      .map((c) => `<i style="background:${c}"></i>`)
      .join("")}</div>
  </div>
  <iframe src="${base}?shot=react-component.tsx&lines=17-45&mode=dark&width=900"></iframe>`;

mkdirSync(out, { recursive: true });
const server = await serve(PORT);
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
try {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 2 });
  for (const [file, query] of SHOTS) await shoot(page, query, file);

  const iconPage = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 });
  await iconPage.setContent(icon(256));
  await iconPage.locator(".icon").screenshot({ path: join(out, "icon.png"), omitBackground: true });

  const socialPage = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  await socialPage.goto(`${base}?shot=react-component.tsx`); // same origin for the iframe below
  await socialPage.setContent(social());
  await socialPage.frameLocator("iframe").locator("html[data-ready]").waitFor();
  await socialPage.evaluate(() => document.fonts.ready);
  await socialPage.screenshot({ path: join(out, "social.png") });

  console.log(`Wrote ${SHOTS.length + 2} images to images/`);
} finally {
  await browser.close();
  server.close();
}
