# AGENTS.md

Rules for every coding agent in this repo: **Codex** (implementer), **Droid + Gemini** (reviewer), **Claude Code** (reads this via `CLAUDE.md`), and any other tool or human developer.
Read the whole file before starting. The *This repo* section comes first because it holds the facts you need most: base branch, checks, and what must never be touched.

## This repo: terazadl.github.io (blog)

Tera's research blog (Chinese / Japanese / English), built with Hexo 8 and a customized NexT theme.

- **Base branch:** `hexo-src-2` (source). Remote: `origin` = `terazadl/terazadl.github.io`.
- **`master` is generated output.** GitHub Actions (`.github/workflows/deploy.yml`) builds `hexo-src-2` and publishes `public/` to `master`. Never edit, commit to, or push `master`.
- **Pushing to `hexo-src-2` publishes the live site.** Always work on a branch and open a PR into `hexo-src-2`. Never push to it directly.

### Checks (run before every PR — same as CI)

```bash
npx hexo generate && npm test
```

### Rules

- **Editorial rules live in `GEMINI.md` and are binding** for anything under `source/_posts/` or `weeks/`: sourcing (no paywalled text, official primary sources first), language strategy, the weekly-report template, fact vs. judgment separation, and the pre-publish checklist. Read it before touching content.
- Weekly-report skills are in `.agents/skills/` (`weekly-author-cn`, `weekly-author-jp`, `weekly-editor`, `weekly-visual`). Use them for weekly content.
- **Content PRs and code/theme PRs are separate.** Never mix an article edit with a template or CSS change.
- **Do not change published URLs** (permalinks, slugs, dates in paths). If unavoidable, add an alias redirect and say so in the PR.
- **Keep the site light and reachable from mainland China:** no new webfonts, icon fonts, CDNs, or JS libraries. Prefer inline SVG and system fonts.
- Never commit `public/`, `db.json`, `node_modules/`, or `.deploy_git/`.

---

# General rules (all of Tera's repos)

## Who does what

| Role | Who | Does | Never does |
|---|---|---|---|
| Product owner | Tera | Writes Linear issues with acceptance criteria, sets priority, does UAT, merges PRs, deploys | — |
| Implementer | Codex (or a human developer) | One Linear issue → one branch → one PR | Merge, deploy, push to protected branches |
| Reviewer | Droid running Gemini (`pr-reviewer` droid) | Reviews PRs and posts findings | Push commits, approve its own work, merge |

Stay in your role. An agent that implemented a change must not also be its reviewer.
Tera is not an engineer: explain things to her in plain language first, code second.

## 1. Before writing code

1. **There must be a written task with acceptance criteria.** Normally that is a Linear issue (ID like `SITES-12`). Until Linear is set up, a task in the prompt with acceptance criteria also counts; use `TASK` in place of the issue ID. If the criteria are missing or vague, stop and propose them in plain language. Do not guess.
2. **Restate the task** in at most 5 bullets: what will change, what will not, which files you expect to touch, then wait for Tera's OK.
   *Fast lane:* a small fix (one file, about 20 lines or fewer, no logic change — e.g. a typo, a copy tweak, one CSS value) may skip the wait. It still needs the checks and a PR.
3. **Start from the latest base branch** (see *This repo*): `git fetch origin && git switch -c <type>/<ISSUE-ID>-<short-slug> origin/<base>`.

## 2. Scope rules — most bugs come from breaking these

- **One issue per PR.** No drive-by refactors, renames, reformatting, or "while I'm here" fixes. List them under *Follow-ups* in the PR instead.
- **Small diffs.** Aim for under ~300 changed lines and ~10 files. If it will be bigger, say so and propose a split first.
- **No new dependencies**, frameworks, build tools, CDNs, fonts, trackers, or external scripts without explicit approval in the issue.
- **Do not rewrite content** (articles, copy, data, numbers) unless the issue asks for it.
- **Never touch generated output or deploy branches by hand** (see *This repo*).
- **Never commit secrets**: `.env*` (except `.env.example`), tokens, API keys, `.wrangler/`, personal data.
- **Do not delete files** unless the issue says so; list any deletion explicitly in the PR.

## 3. Bugs: reproduce → failing test → fix

1. Reproduce the bug and write down the steps.
2. Add a test or check script that **fails because of this bug**.
3. Fix it and show the same test passing.

If the bug cannot be tested automatically, say why in the PR and give exact manual repro steps for UAT. A fixed bug with no test is expected to come back.

## 4. Definition of done (all required before requesting review)

- [ ] The repo checks in *This repo* pass. Paste a short summary of the output into the PR.
- [ ] New or changed behavior has a test, or a written manual check.
- [ ] UI changes checked at 375px (phone) and desktop widths.
- [ ] `git diff --stat origin/<base>` shows only files this issue needs.
- [ ] PR description follows the template, in plain language.

## 5. Commits and PRs

- Commit format: `type(scope): summary [ISSUE-ID]`. Types: `feat` `fix` `content` `style` `refactor` `test` `chore` `docs`.
- PR title: `[ISSUE-ID] short summary`. PR body starts with `Fixes ISSUE-ID` so Linear links and closes it.
- Never push directly to the base branch. Never force-push a branch someone else is using. Never merge your own PR — Tera merges after UAT.

## 6. Reporting

- Say exactly what you ran, what passed, and **what you did not verify**. Do not write "fixed" or "works" without evidence.
- When unsure, ask one specific question instead of guessing.
- Keep a short *Why this approach* (2–3 sentences, plain language) in every PR. Tera reads these to learn.
