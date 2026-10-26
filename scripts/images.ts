import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { serve } from "./serve.ts";

/*
 * Quick renders of the samples, dark and light side by side, from the preview
 * page: `npm run images`, into `dist/renders/`. Use them for a pull request's
 * before and after. The images in `images/` are designed in Figma ("AlxPro
 * Theme · Images") and exported from there, so this never writes to them.
 * Uses the Chrome you have installed, or Playwright's own Chromium after
 * `npx playwright install chromium`.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist/renders");
const PORT = 4322;
const base = `http://localhost:${PORT}/preview/`;

const SHOTS: [file: string, query: string][] = [
  ["tsx.png", "shot=react-component.tsx&lines=17-45"],
  ["css.png", "shot=globals.css&lines=1-41"],
  ["shell.png", "shot=commands.sh"],
  ["markdown.png", "shot=article.md"],
  ["terminal-tests.png", "shot=terminal:tests"],
  ["terminal-commands.png", "shot=terminal:commands"],
];

async function shoot(page: Page, query: string, file: string, width = 1600) {
  await page.goto(`${base}?${query}&mode=both&width=${width}`);
  await page.waitForSelector("html[data-ready]");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".row").screenshot({ path: join(out, file), omitBackground: true });
}

mkdirSync(out, { recursive: true });
const server = await serve(PORT);
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
try {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 2 });
  for (const [file, query] of SHOTS) await shoot(page, query, file);
  console.log(`Wrote ${SHOTS.length} renders to dist/renders/`);
} finally {
  await browser.close();
  server.close();
}
