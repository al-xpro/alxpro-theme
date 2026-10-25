import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vsctm from "vscode-textmate";
import oniguruma from "vscode-oniguruma";

/*
 * Prints how VS Code colors a file with these themes: every token, its color
 * and its scopes. It tokenizes with the grammars of the VS Code and the
 * extensions installed on this machine — injections included, and with an
 * extension's grammar replacing a built-in one the way it does in the editor —
 * so it shows what you see, which the Shiki preview can't always.
 *
 *   npm run scopes -- samples/react-component.tsx            every line, dark
 *   npm run scopes -- samples/globals.css 13-20 --light      some lines, light
 *   npm run scopes -- samples/globals.css --lang tailwindcss  a language mode
 *
 * VSCODE_APP points at another install's `.../Resources/app` folder.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const language = flag("--lang");
const light = args.includes("--light");
const [file, range] = args.filter((a) => !a.startsWith("--"));
if (!file) {
  console.error("Usage: npm run scopes -- <file> [first-last] [--light] [--lang <language id>]");
  process.exit(1);
}

const app = process.env.VSCODE_APP ?? "/Applications/Visual Studio Code.app/Contents/Resources/app";
const folders = [join(app, "extensions"), join(homedir(), ".vscode/extensions")];

type Contribution = {
  contributes?: {
    languages?: { id: string; extensions?: string[] }[];
    grammars?: { language?: string; scopeName?: string; path?: string; injectTo?: string[] }[];
  };
};

/* Later folders win, as an installed extension's grammar wins over a built-in one. */
const grammarFiles = new Map<string, string>();
const injections = new Map<string, string[]>();
const languageScopes = new Map<string, string>();
const extensionLanguages = new Map<string, string>();
for (const folder of folders.filter(existsSync)) {
  for (const name of readdirSync(folder)) {
    if (name.startsWith("alxpro")) continue;
    const manifest = join(folder, name, "package.json");
    if (!existsSync(manifest)) continue;
    let contribution: Contribution;
    try {
      contribution = JSON.parse(readFileSync(manifest, "utf8"));
    } catch {
      continue;
    }
    for (const lang of contribution.contributes?.languages ?? [])
      for (const ext of lang.extensions ?? []) extensionLanguages.set(ext, lang.id);
    for (const grammar of contribution.contributes?.grammars ?? []) {
      if (!grammar.scopeName || !grammar.path) continue;
      grammarFiles.set(grammar.scopeName, join(folder, name, grammar.path));
      if (grammar.language) languageScopes.set(grammar.language, grammar.scopeName);
      for (const target of grammar.injectTo ?? [])
        injections.set(target, [...(injections.get(target) ?? []), grammar.scopeName]);
    }
  }
}

const languageId = language ?? extensionLanguages.get(extname(file));
const scope = languageId && languageScopes.get(languageId);
if (!scope) {
  console.error(`No grammar for ${file}${languageId ? ` (language ${languageId})` : ""}.`);
  process.exit(1);
}

const theme = JSON.parse(
  readFileSync(join(root, "themes/vscode", light ? "alxpro-light.json" : "alxpro-dark.json"), "utf8")
);
const wasm = readFileSync(join(root, "node_modules/vscode-oniguruma/release/onig.wasm"));
await oniguruma.loadWASM(wasm.buffer as ArrayBuffer);

const registry = new vsctm.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (sources: string[]) => new oniguruma.OnigScanner(sources),
    createOnigString: (text: string) => new oniguruma.OnigString(text),
  }),
  loadGrammar: async (name: string) => {
    const path = grammarFiles.get(name);
    return path ? vsctm.parseRawGrammar(readFileSync(path, "utf8"), path) : null;
  },
  getInjections: (name: string) => injections.get(name),
  theme: {
    name: theme.name,
    settings: [
      { settings: { foreground: theme.colors["editor.foreground"], background: theme.colors["editor.background"] } },
      ...theme.tokenColors,
    ],
  },
});
const grammar = await registry.loadGrammar(scope);
if (!grammar) throw new Error(`Couldn't load ${scope}`);
const colors = registry.getColorMap();

const FOREGROUND_MASK = 0b0000_0000_1111_1111_1000_0000_0000_0000;
const lines = readFileSync(file, "utf8").split("\n");
const [first, last] = range ? range.split("-").map(Number) : [1, lines.length];
console.log(`${file}: ${languageId} (${scope}), ${theme.name}\n`);

let state = vsctm.INITIAL;
lines.forEach((line, i) => {
  const { tokens, ruleStack } = grammar.tokenizeLine(line, state);
  const { tokens: packed } = grammar.tokenizeLine2(line, state);
  state = ruleStack;
  if (i + 1 < first || i + 1 > (last ?? first)) return;
  console.log(`${String(i + 1).padStart(4)}  ${line}`);
  for (const token of tokens) {
    const text = line.slice(token.startIndex, token.endIndex);
    if (!text.trim()) continue;
    /* The packed form carries the color, as an index in bits 15–23: the
       last entry starting at or before this token is the one that applies. */
    let color = colors[1];
    for (let j = 0; j < packed.length; j += 2) {
      if (packed[j] <= token.startIndex) color = colors[(packed[j + 1] & FOREGROUND_MASK) >>> 15];
    }
    console.log(`      ${color}  ${JSON.stringify(text).padEnd(24)} ${token.scopes.slice(1).join(" > ")}`);
  }
});
