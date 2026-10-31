# Contributing

Thanks for helping. AlxPro Theme is small on purpose: a black-and-white palette, with a few
colors that each mean one thing. Fixes that make a language read the way the palette intends
are the most welcome contributions.

## Reporting a wrong color

[Open a "Wrong color" issue](https://github.com/al-xpro/alxpro-theme/issues/new/choose).
Include:

- the language and a few lines of code that show it;
- the token's scope, from **Developer: Inspect Editor Tokens and Scopes** in VS Code;
- a screenshot, and which theme (dark or light).

For a new feature, format or language, open a "Change" issue first, so we can agree on it
before you write code.

## Setting up

You need Node 24.

```bash
git clone https://github.com/al-xpro/alxpro-theme.git && cd alxpro-theme
npm install
npm run build     # regenerate every theme from src/
npm run check     # contrast and file checks
```

Open the repository in VS Code and press **F5** to try your change in an Extension
Development Host. [`samples/`](samples/) has a sample for each language the theme covers, and
`npm run preview` renders them at <http://localhost:4321/preview/>.

## The rules

- **Colors live only in [`src/palette.ts`](src/palette.ts).** A wrong color in one language
  is almost always a scope problem: find the scope with `npm run scopes -- <file>`, then
  change the scope lists in [`src/formats/vscode.ts`](src/formats/vscode.ts), not the colors.
- **Never edit the generated files** (`themes/`, `npm/package.json`) by hand. Run
  `npm run build` and commit what it writes; CI fails if they differ from a fresh build.
- **Amber is only for props:** attributes in markup, and the props a component receives in its
  parameters.
- Every text color keeps WCAG AA contrast; `npm run check` fails otherwise.

[`AGENTS.md`](AGENTS.md) has the full set, for people and coding agents alike.

## Pull requests

1. Branch from `main`, named after the issue: `fix/12-css-variables`.
2. Commit in the [Conventional Commits](https://www.conventionalcommits.org) style:
   `fix(css): color variables in @theme as text`.
3. Before opening the pull request, run `npm run typecheck`, `npm run build` and
   `npm run check`.
4. Fill in the pull request template, with `Closes #<issue>`. For anything visible, add
   before and after screenshots: VS Code, or `npm run images`.

Every pull request is reviewed before it's merged. Review comments are answered with new
commits on the same branch.

## Conduct and security

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md). To report a
vulnerability, see the [security policy](SECURITY.md); please don't open a public issue for it.

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
