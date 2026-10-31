# Changelog

All notable changes to this project. Versions follow [semver](https://semver.org): a
patch changes a color, a minor adds a format or a language, a major changes what a role
means.

## Unreleased

### Changed

- Amber also marks the props a component receives: the names unpacked in its parameters,
  as in `function Card({ title, href })`. A prop is now amber where it's passed and where
  it's received.

## 1.2.0 — 2026-10-28

### Added

- Code blocks in VS Code's Markdown preview use the palette while AlxPro Dark or Light is
  active. Other themes' previews are unchanged.
- The README says which extensions change the colors: install Tailwind CSS IntelliSense,
  don't use PostCSS Language Support, and know that Red Hat's YAML and GitHub Actions turn
  a key like `on:` blue.

### Fixed

- The README's palette table lists CSS units with the pink of keywords.

### Removed

- The Zed theme. Zed can't tell apart several things VS Code colors differently (`const`
  names, enums, CSS property names), so it couldn't look the same there. It was never
  published to Zed's registry.

## 1.1.1 — 2026-10-27

### Changed

- CSS units (`px`, `rem`, `fr`, `%`) are pink, the keyword color, instead of red.

### Fixed

- Zed: JSX components are blue and the `=` of JSX attributes pink; JSON keys are pink; CSS
  selectors are purple, units pink and colors blue, as in VS Code. The README lists what Zed
  can't match.

## 1.1.0 — 2026-10-26

### Added

- A welcome walkthrough in VS Code that opens after installing, with an "ALXPRO THEME"
  banner and steps for theme, system appearance, font and terminal.
- `install.sh`: one command installs the theme for the terminal it runs in, then prints the
  banner. It never edits config files.
- `npm run scopes`, which shows each token's color and scopes as the installed VS Code
  colors them.
- New README and marketplace images, designed in Figma.
- The `alxpro-theme` npm package: Shiki themes, xterm.js terminal colors, the full palette
  and CSS custom properties, typed, generated from the same palette and released with the
  same version.
- A Zed extension with both themes, mapped to Zed's tree-sitter highlight names.
- A contributing guide, a code of conduct and a security policy.

### Changed

- Amber is only for props and attributes in markup; properties are purple.
- Types, interfaces, classes, constructors, components, `const` names and objects (`event`
  in `event.preventDefault()`) are blue. CSS pseudo-classes are purple.
- Code blocks in Markdown and chat, and the find widget around its input, are `#0A0A0A` in
  the dark theme and `#FAFAFA` in the light one.
- Your chat messages, Markdown callouts and inputs use the field color: `#0A0A0A` in dark,
  `#FAFAFA` in light.
- Inline code is white (black) text on `#2A2A2A` (`#E8E8E8`), in a gray border.
- The command palette, suggestions, hovers, menus, notifications and peek views are black
  (white); modal editor headers and the title bar are `#FAFAFA` in light.
- Badges are white with black numbers in the dark theme, black with white in the light.
- The debugging status bar inverts instead of turning amber. A picked row in the sidebar
  has no outline; buttons are pure white (black) and fade on hover.
- The Agents window uses the theme.

### Fixed

- Inline code in Markdown is plain text; only its backticks are colored.
- CSS variables are white inside Tailwind's `@theme` and blue in `:root` and `var()`.

## 1.0.0 — 2026-10-25

The first public release.

### Added

- AlxPro Dark and AlxPro Light for VS Code and Cursor, with pure black and pure white
  backgrounds and every editor surface themed.
- Matching terminal themes for Terminal.app, iTerm2, Ghostty, Warp, Windows Terminal,
  Alacritty, Kitty and WezTerm.
- Amber props and properties; purple shell commands with green arguments.
- Every theme generated from one palette (`src/palette.ts`), with contrast checks in CI.
- 18 sample files, 8 terminal samples and a preview page for testing colors.
