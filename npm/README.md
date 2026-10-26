# alxpro-theme

AlxPro Dark and AlxPro Light for the web: the code and terminal colors of the
[AlxPro VS Code theme](https://github.com/al-xpro/alxpro-theme), for your site, blog and docs.
Pure black and pure white, with a few colors that each mean one thing.

```bash
npm install alxpro-theme
```

| Import | What it is |
| --- | --- |
| `alxproDark`, `alxproLight`, `themes` | Shiki / TextMate themes, named `alxpro-dark` and `alxpro-light` |
| `terminal.dark`, `terminal.light` | Terminal colors as xterm.js's `ITheme`, plus a terminal block's `header`, `border`, `muted` and `prompt` |
| `palette.dark`, `palette.light` | Every color: syntax roles, the 16 ANSI colors, editor UI |
| `alxpro-theme/dark.json`, `alxpro-theme/light.json` | The Shiki themes as JSON files |
| `alxpro-theme/css` | Every color as a CSS custom property, light on `:root`, dark under `.dark` or `[data-theme="dark"]` |

Everything is typed.

## Shiki

```ts
import { createHighlighter } from "shiki";
import { alxproDark, alxproLight } from "alxpro-theme";

const highlighter = await createHighlighter({
  themes: [alxproDark, alxproLight],
  langs: ["tsx", "css", "bash"],
});

const html = highlighter.codeToHtml(code, {
  lang: "tsx",
  themes: { light: "alxpro-light", dark: "alxpro-dark" },
});
```

With both themes, Shiki writes the light color inline and the dark one as `--shiki-dark` on
each token. Switch to it with CSS, for example under a `.dark` class:

```css
.dark .shiki,
.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

## rehype-pretty-code and Expressive Code

```ts
import rehypePrettyCode from "rehype-pretty-code";
import { alxproDark, alxproLight } from "alxpro-theme";

rehypePrettyCode({ theme: { dark: alxproDark, light: alxproLight } });
```

```ts
// astro.config.mjs or ec.config.mjs
import expressiveCode from "astro-expressive-code";
import { alxproDark, alxproLight } from "alxpro-theme";

expressiveCode({ themes: [alxproDark, alxproLight] });
```

## Terminals

```ts
import { Terminal } from "@xterm/xterm";
import { terminal } from "alxpro-theme";

new Terminal({ theme: terminal.dark });
```

For a terminal drawn in HTML, the same colors are custom properties:

```css
@import "alxpro-theme/css";

.terminal {
  background: var(--alxpro-terminal-background);
  color: var(--alxpro-terminal-foreground);
}
.terminal .red {
  color: var(--alxpro-terminal-red);
}
```

Every key has one: `--alxpro-syntax-*`, `--alxpro-terminal-*` (`background`, `bright-red`,
`selection-background`, …) and `--alxpro-ui-*`.

## Tailwind CSS

```css
@import "tailwindcss";
@import "alxpro-theme/css";

@theme inline {
  --color-keyword: var(--alxpro-syntax-keyword);
  --color-string: var(--alxpro-syntax-string);
}
```

## Versions

The package has the same version as the VS Code extension and is generated from the same
palette, so a version number means the same colors everywhere.

## License

MIT © 2026 Alex Prostamo. Colors inspired by Vercel's Geist design system; not affiliated with
or endorsed by Vercel.
