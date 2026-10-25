---
title: Shipping a theme
date: 2026-10-25
tags: [vscode, design]
---

# Shipping a theme

A theme is **mostly restraint**: a _few_ colors, used ~~everywhere~~ on purpose.
Read the [color theme guide](https://code.visualstudio.com/api/extension-guides/color-theme)
or visit <https://example.com>.

## Checklist

1. Write the palette once
2. Generate every format from it
   - VS Code
   - Terminals

- [x] Test in light and dark
- [ ] Take the screenshots

> Contrast is not a preference.

Inline `code`, and a fenced block:

```ts
export const answer = 42;
```

| Role    | Dark      | Light     |
| ------- | --------- | --------- |
| Keyword | `#F6608F` | `#BD2864` |

---

![The dark theme](./images/dark.png "Dark")
