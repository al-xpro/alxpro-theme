import type { Hex, Palette } from "../palette.ts";

/*
 * Both palettes as one Zed theme family, in Zed's theme schema v0.2.0, and
 * the extension around it. Zed's highlight names come from tree-sitter, not
 * TextMate scopes, so each `Syntax` role is mapped to them here; the colors
 * are the palette's, as everywhere else. `scripts/build.ts` writes `zed/`.
 */

/** A color with an alpha, as Zed reads it: `#RRGGBBAA`. */
const alpha = (hex: Hex, aa: string) => `${hex.slice(0, 7)}${aa}`;

const ANSI = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

function style(p: Palette) {
  const { syntax: s, terminal: t, ui: u } = p;
  const status = (name: string, color: Hex) => ({
    [name]: color,
    [`${name}.background`]: alpha(color, "1A"),
    [`${name}.border`]: alpha(color, "66"),
  });
  const terminalColors = Object.fromEntries(
    ANSI.flatMap((name, i) => [
      [`terminal.ansi.${name}`, t.ansi[i]],
      [`terminal.ansi.bright_${name}`, t.ansi[i + 8]],
      [`terminal.ansi.dim_${name}`, alpha(t.ansi[i], "B3")],
    ])
  );
  const syntaxColor = (color: Hex, extra: object = {}) => ({ color, ...extra });

  return {
    "background.appearance": "opaque",
    background: u.background,
    "surface.background": u.background,
    "elevated_surface.background": u.background,
    "panel.background": u.background,
    "status_bar.background": u.background,
    "title_bar.background": u.header,
    "title_bar.inactive_background": u.header,
    "toolbar.background": u.background,
    "tab_bar.background": u.background,
    "tab.inactive_background": u.background,
    "tab.active_background": u.background,

    border: u.border,
    "border.variant": u.border,
    "border.focused": u.accent,
    "border.selected": u.accent,
    "border.transparent": "#00000000",
    "border.disabled": u.border,
    "pane.focused_border": u.borderStrong,
    "pane_group.border": u.border,
    "panel.focused_border": u.borderStrong,
    "panel.indent_guide": u.border,
    "panel.indent_guide_active": u.borderStrong,
    "panel.indent_guide_hover": u.borderStrong,

    "element.background": u.field,
    "element.hover": u.hover,
    "element.active": u.active,
    "element.selected": u.active,
    "element.disabled": u.field,
    "ghost_element.background": "#00000000",
    "ghost_element.hover": u.hover,
    "ghost_element.active": u.active,
    "ghost_element.selected": u.active,
    "ghost_element.disabled": "#00000000",
    "drop_target.background": alpha(u.accent, "26"),

    text: u.text,
    "text.muted": u.muted,
    "text.placeholder": u.subtle,
    "text.disabled": u.faint,
    "text.accent": u.accent,
    icon: u.text,
    "icon.muted": u.muted,
    "icon.disabled": u.faint,
    "icon.placeholder": u.subtle,
    "icon.accent": u.accent,
    "link_text.hover": u.accent,

    "editor.background": u.background,
    "editor.foreground": s.foreground,
    "editor.gutter.background": u.background,
    "editor.subheader.background": u.field,
    "editor.active_line.background": u.lineHighlight,
    "editor.highlighted_line.background": u.lineHighlight,
    "editor.line_number": s.comment,
    "editor.active_line_number": u.strong,
    "editor.invisible": u.borderStrong,
    "editor.wrap_guide": u.border,
    "editor.active_wrap_guide": u.borderStrong,
    "editor.indent_guide": u.border,
    "editor.indent_guide_active": u.borderStrong,
    "editor.document_highlight.read_background": alpha(u.accent, "1A"),
    "editor.document_highlight.write_background": alpha(u.accent, "26"),
    "editor.document_highlight.bracket_background": alpha(u.accent, "26"),
    "search.match_background": u.findMatch,

    "scrollbar.thumb.background": alpha(u.strong, "1A"),
    "scrollbar.thumb.hover_background": alpha(u.strong, "26"),
    "scrollbar.thumb.border": "#00000000",
    "scrollbar.track.background": "#00000000",
    "scrollbar.track.border": "#00000000",

    ...status("created", u.added),
    ...status("success", u.added),
    ...status("modified", u.modified),
    ...status("warning", u.warning),
    ...status("deleted", u.deleted),
    ...status("error", u.error),
    ...status("renamed", u.renamed),
    ...status("conflict", u.conflict),
    ...status("info", u.info),
    ...status("hint", u.subtle),
    ...status("hidden", u.faint),
    ...status("ignored", u.faint),
    ...status("unreachable", u.faint),
    ...status("predictive", u.faint),

    "terminal.background": t.background,
    "terminal.foreground": t.foreground,
    "terminal.bright_foreground": u.strong,
    "terminal.dim_foreground": u.muted,
    "terminal.ansi.background": t.background,
    ...terminalColors,

    players: [{ cursor: u.strong, background: u.strong, selection: u.selection }],

    /*
     * Tree-sitter's highlight names, each given the role it plays here. Zed
     * colors a capture by its longest matching key, so `tag.component.jsx`
     * takes `tag.component`, and `selector.class` takes `selector`.
     */
    syntax: {
      attribute: syntaxColor(s.attribute),
      boolean: syntaxColor(s.constant),
      comment: syntaxColor(s.comment, { font_style: "italic" }),
      "comment.doc": syntaxColor(s.comment, { font_style: "italic" }),
      constant: syntaxColor(s.constant),
      constructor: syntaxColor(s.type),
      embedded: syntaxColor(s.foreground),
      emphasis: syntaxColor(s.foreground, { font_style: "italic" }),
      "emphasis.strong": syntaxColor(s.foreground, { font_weight: 700 }),
      enum: syntaxColor(s.type),
      function: syntaxColor(s.function),
      "function.builtin": syntaxColor(s.function),
      hint: syntaxColor(u.subtle),
      keyword: syntaxColor(s.keyword),
      "keyword.modifier": syntaxColor(s.keyword),
      label: syntaxColor(s.foreground),
      link_text: syntaxColor(s.link),
      link_uri: syntaxColor(s.link, { font_style: "italic" }),
      number: syntaxColor(s.constant),
      operator: syntaxColor(s.operator),
      predictive: syntaxColor(u.faint, { font_style: "italic" }),
      preproc: syntaxColor(s.keyword),
      primary: syntaxColor(s.foreground),
      property: syntaxColor(s.property),
      "property.json_key": syntaxColor(s.key),
      punctuation: syntaxColor(s.punctuation),
      "punctuation.bracket": syntaxColor(s.punctuation),
      "punctuation.delimiter": syntaxColor(s.punctuation),
      "punctuation.delimiter.jsx": syntaxColor(s.operator),
      "punctuation.list_marker": syntaxColor(s.punctuation),
      "punctuation.special": syntaxColor(s.escape),
      selector: syntaxColor(s.selector),
      string: syntaxColor(s.string),
      "string.escape": syntaxColor(s.escape),
      "string.regex": syntaxColor(s.regex),
      // CSS colors and HTML entities in JSX.
      "string.special": syntaxColor(s.constant),
      "string.special.symbol": syntaxColor(s.constant),
      tag: syntaxColor(s.tag),
      "tag.component": syntaxColor(s.type),
      // Inline code in Markdown reads as text, as in VS Code.
      "text.literal": syntaxColor(s.foreground),
      title: syntaxColor(s.heading, { font_weight: 700 }),
      type: syntaxColor(s.type),
      "type.definition": syntaxColor(s.type),
      "type.unit": syntaxColor(s.unit),
      variable: syntaxColor(s.foreground),
      // console, window: only with semantic tokens on, which tell built-ins apart.
      "variable.builtin": syntaxColor(s.constant),
      "variable.special": syntaxColor(s.keyword),
      variant: syntaxColor(s.constant),
    },
  };
}

export function zedTheme(palettes: readonly Palette[]): string {
  return `${JSON.stringify(
    {
      $schema: "https://zed.dev/schema/themes/v0.2.0.json",
      name: "AlxPro",
      author: "Alex Prostamo",
      themes: palettes.map((p) => ({ name: p.name, appearance: p.type, style: style(p) })),
    },
    null,
    2
  )}\n`;
}

/** The extension's manifest. Its id ends in `-theme`, as Zed asks of theme extensions. */
export function zedExtension(version: string): string {
  return [
    'id = "alxpro-theme"',
    'name = "AlxPro Theme"',
    `version = "${version}"`,
    "schema_version = 1",
    'authors = ["Alex Prostamo"]',
    'description = "Black-and-white dark and light themes for web development, with a few colors that each mean one thing."',
    'repository = "https://github.com/al-xpro/alxpro-theme"',
    "",
  ].join("\n");
}
