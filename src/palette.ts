/*
 * The only place colors are written.
 *
 * Every file in `themes/` is generated from the two palettes below by
 * `npm run build`: the VS Code themes and every terminal's. Change a color
 * here and every editor, terminal and language follows; never edit `themes/`
 * by hand, CI rejects a generated file that doesn't match this one.
 *
 * Backgrounds are pure black and pure white. The accents are Geist's, tuned
 * so every color that draws text keeps at least 4.5:1 against them.
 */

export type Hex = `#${string}`;

/** One color per role. Which scopes play each role is decided in `formats/vscode.ts`. */
export type Syntax = {
  /** Plain text and identifiers nothing else claims. */
  foreground: Hex;
  /** Comments and doc comments. */
  comment: Hex;
  /** Brackets, commas, dots, semicolons, a tag's `<` and `>`, JSX's `{}`. */
  punctuation: Hex;
  /** `const`, `if`, `return`, `import`, `async`, operators spelled as words. */
  keyword: Hex;
  /** `=`, `=>`, `+`, `&&`, `?.`, a shell's `|` and `>`. */
  operator: Hex;
  /** Strings, template strings, quoted attribute values. */
  string: Hex;
  /** Escapes (`\n`) and a template's `${` and `}`. */
  escape: Hex;
  /** Regular expressions. */
  regex: Hex;
  /** Numbers, `true`, `false`, `null`, enum members, `const` names, and the object in `event.preventDefault()`. */
  constant: Hex;
  /** Function and method names, at definition and call. */
  function: Hex;
  /** Types, interfaces, classes, constructors in `new X()`, and components in JSX. */
  type: Hex;
  /** Properties: object keys, `.checked` in `e.target.checked`, interface members. */
  property: Hex;
  /** Props and attributes in markup: `className=`, `href=`, Vue's `:class`. Kept to markup on purpose. */
  attribute: Hex;
  /** Keys in data files: JSON and YAML. */
  key: Hex;
  /** CSS property names, custom properties and the bare words in a value. */
  styleProperty: Hex;
  /** CSS units: `ms`, `px`, `%`. */
  unit: Hex;
  /** Function parameters. */
  parameter: Hex;
  /** HTML and JSX tag names, components, CSS element selectors. */
  tag: Hex;
  /** CSS class and id selectors (`.card`, `#main`). */
  selector: Hex;
  /** CSS pseudo-classes and pseudo-elements (`:hover`, `::after`). */
  pseudo: Hex;
  /** Shell commands: `pnpm`, `git`, `cd`, `sudo`. */
  command: Hex;
  /** Everything a shell command is given: subcommands, flags, paths, words. */
  argument: Hex;
  /** Diff insertions. */
  inserted: Hex;
  /** Diff deletions, invalid code. */
  deleted: Hex;
  /** Markdown headings. */
  heading: Hex;
  /** Markdown's inline marks: `**`, `_`, `~~`, backticks, a link's brackets. */
  markup: Hex;
  /** Links and URLs. */
  link: Hex;
};

export type Terminal = {
  background: Hex;
  foreground: Hex;
  cursor: Hex;
  /** May carry alpha; formats without alpha get it blended onto the background. */
  selection: Hex;
  /** The 16 ANSI colors: black, red, green, yellow, blue, magenta, cyan, white, then the brights. */
  ansi: readonly [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex];
};

/** The editor's chrome, as a handful of roles that `formats/vscode.ts` spreads over VS Code's keys. */
export type Ui = {
  background: Hex;
  /** Raised surfaces: menus, inputs, hovers, suggestions. */
  surface: Hex;
  /** Code blocks in Markdown and chat, and the find widget around its input. */
  block: Hex;
  /** Inputs, and what VS Code draws with them, such as your own messages in a chat. */
  field: Hex;
  hover: Hex;
  /** A selected row. */
  active: Hex;
  border: Hex;
  /** Inputs, and anything that has to read as an edge. */
  borderStrong: Hex;
  text: Hex;
  strong: Hex;
  muted: Hex;
  subtle: Hex;
  faint: Hex;
  accent: Hex;
  onAccent: Hex;
  button: Hex;
  onButton: Hex;
  buttonHover: Hex;
  secondary: Hex;
  secondaryHover: Hex;
  lineHighlight: Hex;
  selection: Hex;
  findMatch: Hex;
  findMatchOther: Hex;
  added: Hex;
  modified: Hex;
  deleted: Hex;
  renamed: Hex;
  conflict: Hex;
  error: Hex;
  warning: Hex;
  info: Hex;
  shadow: Hex;
};

export type Palette = {
  name: string;
  /** File-name form of the name: `alxpro-dark`. */
  slug: string;
  type: "dark" | "light";
  syntax: Syntax;
  terminal: Terminal;
  ui: Ui;
};

export const dark: Palette = {
  name: "AlxPro Dark",
  slug: "alxpro-dark",
  type: "dark",
  syntax: {
    foreground: "#FFFFFF",
    comment: "#A0A0A0",
    punctuation: "#FFFFFF",
    keyword: "#F6608F",
    operator: "#F6608F",
    string: "#62C073",
    escape: "#F6608F",
    regex: "#62C073",
    constant: "#52A8FF",
    function: "#BF7AF0",
    type: "#52A8FF",
    property: "#BF7AF0",
    attribute: "#F2A20D",
    key: "#F6608F",
    styleProperty: "#52A8FF",
    unit: "#FF6166",
    parameter: "#FFFFFF",
    tag: "#62C073",
    selector: "#BF7AF0",
    pseudo: "#BF7AF0",
    command: "#BF7AF0",
    argument: "#62C073",
    inserted: "#62C073",
    deleted: "#FF6166",
    heading: "#FFFFFF",
    markup: "#62C073",
    link: "#52A8FF",
  },
  terminal: {
    background: "#000000",
    foreground: "#EDEDED",
    cursor: "#FFFFFF",
    selection: "#52A8FF4D",
    ansi: [
      "#1F1F1F", "#FF6166", "#62C073", "#F2A20D", "#52A8FF", "#BF7AF0", "#0BC6B4", "#D4D4D4",
      "#8F8F8F", "#FF8A8E", "#8BD99A", "#FFC53D", "#8CC8FF", "#D6A6F7", "#4EDBCB", "#FFFFFF",
    ],
  },
  ui: {
    background: "#000000",
    surface: "#0A0A0A",
    block: "#000000",
    field: "#0A0A0A",
    hover: "#111111",
    active: "#1F1F1F",
    border: "#1F1F1F",
    borderStrong: "#333333",
    text: "#EDEDED",
    strong: "#FFFFFF",
    muted: "#A1A1A1",
    subtle: "#8F8F8F",
    faint: "#666666",
    accent: "#52A8FF",
    onAccent: "#000000",
    button: "#EDEDED",
    onButton: "#000000",
    buttonHover: "#FFFFFF",
    secondary: "#1F1F1F",
    secondaryHover: "#2E2E2E",
    lineHighlight: "#1A1A1A",
    selection: "#52A8FF33",
    findMatch: "#F2A20D66",
    findMatchOther: "#F2A20D33",
    added: "#62C073",
    modified: "#F2A20D",
    deleted: "#FF6166",
    renamed: "#0BC6B4",
    conflict: "#BF7AF0",
    error: "#FF6166",
    warning: "#F2A20D",
    info: "#52A8FF",
    shadow: "#00000099",
  },
};

export const light: Palette = {
  name: "AlxPro Light",
  slug: "alxpro-light",
  type: "light",
  syntax: {
    foreground: "#000000",
    comment: "#666666",
    punctuation: "#000000",
    keyword: "#BD2864",
    operator: "#BD2864",
    string: "#287A3A",
    escape: "#BD2864",
    regex: "#287A3A",
    constant: "#0068D6",
    function: "#781FBB",
    type: "#0068D6",
    property: "#781FBB",
    attribute: "#A35200",
    key: "#BD2864",
    styleProperty: "#0068D6",
    unit: "#CB2A2E",
    parameter: "#000000",
    tag: "#287A3A",
    selector: "#781FBB",
    pseudo: "#781FBB",
    command: "#781FBB",
    argument: "#287A3A",
    inserted: "#287A3A",
    deleted: "#CB2A2E",
    heading: "#000000",
    markup: "#287A3A",
    link: "#0068D6",
  },
  terminal: {
    background: "#FFFFFF",
    foreground: "#171717",
    cursor: "#000000",
    selection: "#0068D626",
    /* The brights are darker than Geist's so text printed in them keeps 4.5:1
       on white; white and bright white sit near the background by convention. */
    ansi: [
      "#171717", "#CB2A2E", "#287A3A", "#A35200", "#0068D6", "#781FBB", "#08796E", "#A1A1A1",
      "#666666", "#E1292F", "#358443", "#B45E00", "#1072E2", "#9D4DDB", "#0C8378", "#D4D4D4",
    ],
  },
  ui: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    block: "#FAFAFA",
    field: "#FAFAFA",
    hover: "#F5F5F5",
    active: "#EBEBEB",
    border: "#EAEAEA",
    borderStrong: "#D4D4D4",
    text: "#171717",
    strong: "#000000",
    muted: "#666666",
    subtle: "#8F8F8F",
    faint: "#A1A1A1",
    accent: "#0068D6",
    onAccent: "#FFFFFF",
    button: "#171717",
    onButton: "#FFFFFF",
    buttonHover: "#383838",
    secondary: "#EBEBEB",
    secondaryHover: "#E0E0E0",
    lineHighlight: "#F5F5F5",
    selection: "#0068D622",
    findMatch: "#A3520040",
    findMatchOther: "#A352001F",
    added: "#287A3A",
    modified: "#A35200",
    deleted: "#CB2A2E",
    renamed: "#08796E",
    conflict: "#781FBB",
    error: "#CB2A2E",
    warning: "#A35200",
    info: "#0068D6",
    shadow: "#00000026",
  },
};

export const palettes = [dark, light] as const;
