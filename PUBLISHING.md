# Publishing

How AlxPro Theme reaches each place it's published. Everything is generated from
`src/palette.ts` by `npm run build`, and every place gets the same version, the one in
`package.json`.

| Where | What | Who it reaches | After the first time |
| --- | --- | --- | --- |
| [GitHub Releases](#1-github-release) | `.vsix`, terminal themes | everyone | automatic on a tag |
| [VS Code Marketplace](#2-vs-code-marketplace) | the extension | VS Code | upload the `.vsix` (see the note on 1 December 2026) |
| [Open VSX](#3-open-vsx) | the extension | Cursor, Windsurf, VSCodium, Gitpod | automatic with `OVSX_PAT` |
| [npm](#4-npm) | `alxpro-theme` | sites, blogs, docs, xterm.js | automatic with `NPM_PUBLISH` |
| [Zed](#5-zed) | `zed/` | Zed | a pull request per version |
| [iTerm2-Color-Schemes](#6-iterm2-color-schemes) | `.itermcolors` | Ghostty's built-in list, plus generated Alacritty, Kitty, WezTerm, Windows Terminal… | once; again only if colors change |
| [Warp themes](#7-warp-themes) | Warp YAML | Warp's theme gallery | once; again only if colors change |

## Before every release

1. Merge everything for the release into `main`. `CHANGELOG.md` has a `## X.Y.Z — date`
   section, and `package.json` has that version.
2. On an up-to-date `main`:

   ```bash
   git switch main && git pull
   npm ci && npm run build && npm run check   # must print ✓ and change no files
   ```

## 1. GitHub release

```bash
git tag -a v1.1.0 -m "v1.1.0"
git push origin v1.1.0
```

The **Release** workflow checks the tag matches `package.json`, builds, packages
`alxpro-theme-v1.1.0.vsix` and `alxpro-theme-v1.1.0-all-themes.zip`, creates the release with
the changelog section as notes, then publishes to every registry set up below.

## 2. VS Code Marketplace

**Once:**

1. Sign in at <https://marketplace.visualstudio.com/manage> with a Microsoft account.
2. **Create publisher**: ID `alxpro` (permanent; it must match `publisher` in
   `package.json`), name `AlxPro`. Add the logo and links if you like.

**Every release, until 30 November 2026 (with a token):**

1. Open <https://dev.azure.com>, sign in with the same Microsoft account, and create an
   organization if you don't have one (any name).
2. User settings (next to your avatar) → **Personal access tokens** → **New Token**:
   - Organization: **All accessible organizations**
   - Scopes: **Custom defined** → **Show all scopes** → **Marketplace** → **Manage**
   - Copy the token.
3. Publish:

   ```bash
   npx vsce login alxpro          # paste the token
   npm run package                # writes dist/alxpro-theme-X.Y.Z.vsix
   npx vsce publish --packagePath dist/alxpro-theme-1.1.0.vsix
   ```

   To automate it until 1 December, save the token as the repository secret `VSCE_PAT`.

**From 1 December 2026**, Azure DevOps retires global personal access tokens, and Microsoft
documents token-free publishing (Microsoft Entra ID, `vsce publish --azure-credential`) only
for Azure Pipelines. For a personal account, upload by hand:

1. <https://marketplace.visualstudio.com/manage> → publisher `alxpro`.
2. First time: **New extension** → **Visual Studio Code** → upload the `.vsix` from the GitHub
   release. Afterwards: the extension's **⋯** menu → **Update** → upload the new `.vsix`.
3. Remove the `VSCE_PAT` secret; the workflow skips the step without it.

The listing appears within minutes at
`https://marketplace.visualstudio.com/items?itemName=alxpro.alxpro-theme`. Set it as the
repository's website.

## 3. Open VSX

**Once:**

1. Sign in at <https://open-vsx.org> with GitHub (`al-xpro`).
2. **Settings → Profile → Log in with Eclipse**: create an eclipse.org account if needed,
   then sign the **Publisher Agreement** there.
3. **Settings → Access Tokens → Generate New Token**. Copy it.
4. Create the namespace and publish:

   ```bash
   npx ovsx create-namespace alxpro -p <token>
   npx ovsx publish dist/alxpro-theme-1.1.0.vsix -p <token>
   ```

5. **Claim the namespace**, so nobody else can publish into it: open an issue at
   <https://github.com/EclipseFdn/open-vsx.org/issues/new/choose> with the "Claim namespace
   ownership" template, for `alxpro`.
6. Save the token as the repository secret `OVSX_PAT` (GitHub → Settings → Secrets and
   variables → Actions → New repository secret). Every tag publishes from then on.

Cursor shows extensions from Open VSX after its own malware scan, usually within a day.

## 4. npm

**Once:**

1. Create an account at <https://www.npmjs.com/signup> and turn on two-factor
   authentication (Account → Two-Factor Authentication).
2. Publish the first version by hand, from an up-to-date `main` after `npm run build`:

   ```bash
   npm login
   npm publish ./npm --access public     # asks for a 2FA code
   ```

3. Set up **trusted publishing**, so releases publish from GitHub with no token stored
   anywhere: <https://www.npmjs.com/package/alxpro-theme/access> → **Trusted Publisher** →
   **GitHub Actions**:
   - Organization or user: `al-xpro`
   - Repository: `alxpro-theme`
   - Workflow filename: `release.yml`
   - Environment: leave empty
4. On the same page, set **Publishing access** to "Require two-factor authentication and
   disallow tokens". Trusted publishing still works; stolen tokens don't.
5. GitHub → Settings → Secrets and variables → Actions → **Variables** → New repository
   variable: `NPM_PUBLISH` = `true`.

Every tag then publishes `npm/` with provenance, so npm shows it was built by this
repository's workflow.

## 5. Zed

**Try it locally:** install Zed, open the Extensions page (`cmd-shift-x`) → **Install Dev
Extension** → choose this repository's `zed/` folder. Then `cmd-k cmd-t` → **AlxPro Dark** or
**AlxPro Light**.

**Submit (once):**

1. Fork <https://github.com/zed-industries/extensions>, and clone your fork *without* its
   hundreds of submodules:

   ```bash
   git clone https://github.com/al-xpro/extensions.git zed-extensions && cd zed-extensions
   git submodule add https://github.com/al-xpro/alxpro-theme.git extensions/alxpro-theme
   ```

   The submodule must use the HTTPS URL, and point at a commit that's on `main` here.
2. Add to `extensions.toml`:

   ```toml
   [alxpro-theme]
   submodule = "extensions/alxpro-theme"
   path = "zed"
   version = "1.1.0"
   ```

   `version` must match `zed/extension.toml` at that commit.
3. Sort, commit and open the pull request:

   ```bash
   pnpm install && pnpm sort-extensions
   git checkout -b alxpro-theme
   git add .gitmodules extensions.toml extensions/alxpro-theme
   git commit -m "Add AlxPro Theme"
   git push -u origin alxpro-theme
   gh pr create --repo zed-industries/extensions --title "Add AlxPro Theme"
   ```

**Every later version:** in your fork, sync with upstream, then

```bash
git submodule update --init --remote extensions/alxpro-theme
# set version in extensions.toml to the new zed/extension.toml version
pnpm sort-extensions && git commit -am "Update AlxPro Theme to X.Y.Z"
```

and open a pull request again.

## 6. iTerm2-Color-Schemes

The collection Ghostty builds its theme list from (weekly), which also generates files for
Alacritty, Kitty, WezTerm, Windows Terminal and more. Submit once the colors are settled; a
theme's name there is hard to change.

1. Fork <https://github.com/mbadolato/iTerm2-Color-Schemes> and clone it:

   ```bash
   git clone --depth 1 https://github.com/al-xpro/iTerm2-Color-Schemes.git && cd iTerm2-Color-Schemes
   python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   ```

2. Copy the themes, named exactly as they should be displayed:

   ```bash
   cp ../alxpro-theme/themes/iterm2/*.itermcolors schemes/
   ```

3. Generate every format, and the screenshots:

   ```bash
   python3 tools/gen.py -s "AlxPro Dark"
   python3 tools/gen.py -s "AlxPro Light"
   pushd tools && python3 -m screenshot_gen && popd
   ```

4. Add both to `licenses.yml`, then check:

   ```yaml
   AlxPro Dark:
     license: MIT
     source: https://github.com/al-xpro/alxpro-theme
   AlxPro Light:
     license: MIT
     source: https://github.com/al-xpro/alxpro-theme
   ```

   ```bash
   python3 tools/check_licenses.py
   ```

5. Add both themes and their screenshots to `README.md`, in the dark and light sections, in
   alphabetical order like the others. Optionally credit yourself in `CREDITS.md`.
6. Commit everything the steps produced and open the pull request.

`gen.py` may nudge a color that's under its 1.75:1 minimum contrast (our ANSI black sits
near the background on purpose). That's expected.

Once it's merged and Ghostty has updated, `theme = light:AlxPro Light,dark:AlxPro Dark` works
in Ghostty with no files to install.

## 7. Warp themes

1. Fork <https://github.com/warpdotdev/themes> and clone it.
2. Copy the themes into `standard/` and generate their previews:

   ```bash
   cp ../alxpro-theme/themes/warp/alxpro_dark.yaml ../alxpro-theme/themes/warp/alxpro_light.yaml standard/
   pip install PyYAML
   python3 ./scripts/gen_theme_previews.py standard
   ```

3. Commit the two YAML files and the generated previews, and open the pull request.

## Checklist for a release

- [ ] `CHANGELOG.md` and `package.json` say the same version; `npm run build && npm run check` passes
- [ ] Tag pushed; GitHub release has the `.vsix` and the zip
- [ ] VS Code Marketplace: published or uploaded
- [ ] Open VSX: published (automatic with `OVSX_PAT`)
- [ ] npm: published (automatic with `NPM_PUBLISH`)
- [ ] Zed: pull request with the new version
- [ ] iTerm2-Color-Schemes and Warp: only if the terminal colors changed
- [ ] The Figma images updated, if the colors changed
