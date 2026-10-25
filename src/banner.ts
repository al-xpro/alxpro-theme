/*
 * "ALXPRO THEME" in figlet's ANSI Shadow lettering: the banner VS Code's
 * walkthrough shows on install, and `install.sh` prints after installing a
 * terminal theme. `install.sh` carries a copy of these lines, since it runs on
 * its own through `curl | bash`; `scripts/check.ts` fails if the two differ.
 */

export const banner = {
  alxpro: [
    " █████╗ ██╗     ██╗  ██╗██████╗ ██████╗  ██████╗ ",
    "██╔══██╗██║     ╚██╗██╔╝██╔══██╗██╔══██╗██╔═══██╗",
    "███████║██║      ╚███╔╝ ██████╔╝██████╔╝██║   ██║",
    "██╔══██║██║      ██╔██╗ ██╔═══╝ ██╔══██╗██║   ██║",
    "██║  ██║███████╗██╔╝ ██╗██║     ██║  ██║╚██████╔╝",
    "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ",
  ],
  theme: [
    "████████╗██╗  ██╗███████╗███╗   ███╗███████╗",
    "╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝",
    "   ██║   ███████║█████╗  ██╔████╔██║█████╗  ",
    "   ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝  ",
    "   ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗",
    "   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝",
  ],
};

/** Both words on one row, two cells apart, as the SVG and wide terminals show them. */
export const bannerLines = banner.alxpro.map((line, i) => `${line}  ${banner.theme[i]}`);

/*
 * The banner as an SVG, drawn rather than typeset: a block is a filled cell
 * and each box-drawing shadow is two thin strokes, so it looks the same
 * whatever fonts the viewer has. The gradient runs from the theme's text
 * color to a quarter of it, through VS Code's own variable, so it is white on
 * AlxPro Dark and black on AlxPro Light; the fallback gray shows on anything
 * that can't resolve it.
 */
export function bannerSvg(): string {
  const W = 10;
  const H = 20;
  const pad = 20;
  const cols = Math.max(...bannerLines.map((line) => [...line].length));
  const width = cols * W + pad * 2;
  const height = bannerLines.length * H + pad * 2;

  /* Double strokes, 4px apart, through the middle of the cell. */
  const g = 2;
  const strokes: Record<string, (x: number, y: number) => string> = {
    "═": (x, y) => `M${x} ${y - g}h${W}M${x} ${y + g}h${W}`,
    "║": (x, y) => `M${x - g} ${y - H / 2}v${H}M${x + g} ${y - H / 2}v${H}`,
    "╔": (x, y) => `M${x + W / 2} ${y - g}H${x - g}V${y + H / 2}M${x + W / 2} ${y + g}H${x + g}V${y + H / 2}`,
    "╗": (x, y) => `M${x - W / 2} ${y - g}H${x + g}V${y + H / 2}M${x - W / 2} ${y + g}H${x - g}V${y + H / 2}`,
    "╚": (x, y) => `M${x + W / 2} ${y + g}H${x - g}V${y - H / 2}M${x + W / 2} ${y - g}H${x + g}V${y - H / 2}`,
    "╝": (x, y) => `M${x - W / 2} ${y + g}H${x + g}V${y - H / 2}M${x - W / 2} ${y - g}H${x - g}V${y - H / 2}`,
  };

  const blocks: string[] = [];
  const lines: string[] = [];
  bannerLines.forEach((line, row) => {
    [...line].forEach((char, col) => {
      const x = pad + col * W;
      const y = pad + row * H;
      if (char === "█") blocks.push(`M${x} ${y}h${W}v${H}h${-W}z`);
      else if (strokes[char]) {
        /* `═` runs from the cell's left edge; everything else is drawn from its center. */
        const cx = char === "═" ? x : x + W / 2;
        lines.push(strokes[char](cx, y + H / 2));
      }
    });
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="ALXPRO THEME">`,
    "  <defs>",
    `    <linearGradient id="fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="${height}">`,
    '      <stop offset="0" style="stop-color: var(--vscode-foreground, #8f8f8f); stop-opacity: 1" />',
    '      <stop offset="1" style="stop-color: var(--vscode-foreground, #8f8f8f); stop-opacity: 0.25" />',
    "    </linearGradient>",
    "  </defs>",
    `  <path fill="url(#fade)" d="${blocks.join("")}" />`,
    `  <path fill="none" stroke="url(#fade)" stroke-width="1.5" stroke-opacity="0.6" d="${lines.join("")}" />`,
    "</svg>",
    "",
  ].join("\n");
}
