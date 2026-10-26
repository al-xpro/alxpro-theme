# Working in this repository

**AlxPro Theme**: VS Code and terminal color themes, generated from one palette.

- **Colors live only in `src/palette.ts`.** Which scopes a syntax role colors, and how the
  editor's UI uses the palette, is in `src/formats/vscode.ts`. Terminal formats are in
  `src/formats/terminals.ts`.
- **Never edit `themes/` by hand.** Run `npm run build` and commit what it writes. CI fails
  if `themes/` differs from a fresh build.
- **Before a pull request:** `npm run typecheck`, `npm run build`, `npm run check`. For any
  visible change, attach before/after images: `npm run images`, or screenshots from
  `npm run preview`.
- **A color is wrong in some language?** Find the scope with `npm run scopes -- <file>`,
  which tokenizes with the VS Code and extensions installed on the machine (the Shiki
  preview can differ from VS Code), or with **Developer: Inspect Editor Tokens and Scopes**.
  Then change the scope lists in `src/formats/vscode.ts`, not the colors.
- **Amber is for props and attributes in markup only.** Don't spread it to other roles.
- **Releases:** bump `version` in `package.json`, add a `CHANGELOG.md` entry, merge, and
  tag `vX.Y.Z`. The release workflow does the rest.
- **The banner lives in `src/banner.ts`.** `install.sh` keeps its own copy because it runs
  alone through `curl | bash`; change both, and `npm run check` confirms they match.

---

# Project workflow: publishing and working with agents

How every public project of Alex Prostamo's is published and developed. Copy this file into
each project's repository as `AGENTS.md`, or append it to the project's `CLAUDE.md`, so
every agent working there follows it.

**The model:** Alex orchestrates and reviews; agents implement. Alex writes the issues,
agents open the pull requests, Alex reviews and merges. The repository's history should show
exactly that, honestly and in order.

---

## 1. Publishing a project (once, done by Alex)

Projects are often built privately first and published later. Publishing is a clean line
between the work that existed and the work that comes after.

1. **Scan the whole history for secrets,** not just the latest files: `gitleaks detect` or
   `trufflehog git file://.`. A key deleted in a later commit is still in the history.
   Rotate anything found before publishing.
2. **Remove private data:** `.env` files, client data, real customer names, internal URLs.
   Check `.gitignore`.
3. **Decide on the history:**
   - **Clean** (no secrets, no client data, sensible commits): keep it. The real dates
     prove the real timeline.
   - **Messy or sensitive:** squash it into a single commit, `Initial public release`, and
     say so in the README.
4. **Set the commit email** to the GitHub noreply address if the personal one should stay
   private.
5. **Tag the baseline** as `v1.0` and publish a release for it: the project as it was before
   going public.
6. **Add the basics:** a `LICENSE`, a README (section 6), and the repository's description,
   website and topics.
7. **Protect `main`** with a ruleset (section 5).
8. **Unfinished projects** are either kept private until a usable first version exists, or
   published with "Work in progress" at the top of the README and a roadmap of open issues.

---

## 2. Never

These rules hold for agents and humans alike.

- **Never backdate anything.** No rewritten commit dates, no environment tricks to change
  them. It is dishonest and easy to detect.
- **Never re-create past work** as new issues or pull requests. Features that existed before
  publishing belong to the `v1.0` baseline, not to new issues.
- **Never rewrite published history.** No force-pushes to `main`, no rebasing merged work.
- **Never commit secrets,** keys, tokens, `.env` files or client data.
- **Never merge your own pull request** (agents). Only Alex merges.
- **Never hide that an agent did the work.** See section 4.

---

## 3. The workflow, for every change

### Issues are specs

Every change starts as an issue. Alex writes it; an agent may draft it for Alex to approve.

```markdown
## Context
Why this change, and what exists today.

## Goal
What should be true when it's done, in one or two sentences.

## Acceptance criteria
- [ ] A checkable outcome
- [ ] Another checkable outcome
- [ ] Tests cover the new behavior

## Constraints
Out of scope, patterns to follow, things not to touch.
```

Label it (`feature`, `fix`, `docs`, `refactor`, `chore`) and add it to the current
milestone.

### Branches

One branch per issue, named after it: `feat/12-pricing-table`, `fix/18-mobile-menu`,
`docs/21-readme-setup`. Branch from the latest `main`.

### Commits

Small and focused, in the Conventional Commits style:

```text
feat(pricing): add the annual toggle to the pricing table

Closes #12
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`.

### Pull requests

- **One issue per pull request,** and small enough to review in one sitting. Split large
  issues into several.
- **Link the issue** with `Closes #12`, so merging closes it.
- **Run the checks locally first:** typecheck, lint, tests. Don't open a pull request that
  fails them.
- **Describe what was done,** using this template:

```markdown
## What
One or two sentences on the change.

## Why
The issue it closes and anything worth knowing about the approach.

## How to test
Steps to see it working, or the tests that cover it.

## Screenshots
Before and after, for anything visible.

Closes #
```

### Reviews

Alex reviews every pull request before it's merged, for real:

- comments on anything unclear, risky or wrong;
- **requests changes** when the work doesn't meet the issue's acceptance criteria;
- approves and merges only when it does.

The agent answers review comments with new commits on the same branch, never with a new
pull request. A visible history of reviews that catch mistakes is part of the point.

---

## 4. Agent identity and attribution

Readers of the repository should be able to tell who did what.

- **Agents work under their own identity:** a GitHub App or bot account (for example Claude
  Code's GitHub integration, which shows as a `[bot]` user), so pull requests are visibly
  opened by the agent and visibly reviewed and merged by Alex.
- **When an agent commits through Alex's account,** it keeps its co-author trailer
  (`Co-Authored-By: …`) on every commit.
- **The README says it plainly** (section 6).

Exception: Alex's GitHub profile repository (`al-xpro/al-xpro`) carries no agent
attribution. That rule is specific to that repository.

---

## 5. Repository setup

- **Ruleset on `main`:**
  - changes only through pull requests;
  - one approving review required (Alex's);
  - status checks must pass;
  - no force-pushes, no deletions;
  - linear history (squash or rebase merges).
- **CI on every pull request** (GitHub Actions): install, typecheck, lint, unit tests, and
  end-to-end tests where the project has them. A badge in the README shows the status.
- **Issue and pull request templates** in `.github/` (section 3's templates).
- **Labels:** `feature`, `fix`, `docs`, `refactor`, `chore`, `good first issue`.
- **Milestones** per version: `v1.1`, `v2.0 — [what changes]`.
- **A project board** only if it's actually used to plan the work.
- **Dependabot** for dependency and security updates.

---

## 6. README

The first thing recruiters and developers read. In order:

1. **Name and one-line description,** with the live link.
2. **A screenshot or short video** of the real thing.
3. **What it does:** the main features, in a short list.
4. **Tech stack.**
5. **Architecture:** how the parts fit, with a diagram if it helps.
6. **Getting started:** how to install and run it locally, and the environment variables it
   needs (names only, never values).
7. **How this was built:**

   ```markdown
   ## How this was built
   First version built privately in [months]; published [month year]; new features developed
   in the open since. Built with an agentic workflow: I write issues as specs, agents open
   the pull requests, and I review and merge every change.
   ```

8. **Roadmap:** a link to the open issues or the current milestone.
9. **License.**

---

## 7. Releases

- **Tag every version** (`v1.1`, `v2.0`) and publish a GitHub release with notes: what
  changed, grouped as Added / Changed / Fixed.
- **Keep a `CHANGELOG.md`** with the same groups, newest version first.
- **Version numbers follow semver:** major for breaking changes, minor for features, patch
  for fixes.

The releases tell the project's story at a glance: built privately, published as `v1.0`,
improving in the open since.
