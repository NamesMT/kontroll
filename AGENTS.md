# AGENTS.md

`kontroll` ("control") is a tiny, ESM-only TypeScript library of function-behavior controls —
`debounce`, `countdown`, `throttle` (limit) — plus `clear` and `getInstance`. Node >= 22, zero
dependencies, built with [tsdown](https://github.com/rolldown/tsdown), tested with
[Vitest](https://vitest.dev); published to npm as `kontroll`.

## Docs

Where knowledge lives, and when to reach for each:

| tier | what it holds | when you use it |
| --- | --- | --- |
| `AGENTS.md` — this file | orientation and the rules that prevent defects | read every session; write when a rule is learned the hard way |
| `.agentDocs/` | depth: module rationale, traps with their causes, compatibility | read on demand, before touching that area; write when a rule needs its reasoning kept |
| `docs/` | how-to and reference for a person using this package | read when the task is user-facing; write in the same commit as the change |
| `README.md` | the first read, for a person | write alongside `docs/` |

- **One home per fact.** State the rule here, keep the reasoning in `.agentDocs/` and link it — never both.
- **A dead pointer is a bug.** If the target is gone, delete the pointer rather than leave it.
- Move depth behind a pointer once a section outgrows a screen or two; keep the rule inline.

## Commands

```sh
pnpm run lint             # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test             # vitest watch; `pnpm exec vitest run` for a one-shot
pnpm run test:types       # tsc --noEmit --skipLibCheck
pnpm run check            # lint + test:types + vitest run --coverage — the release gate
pnpm run build            # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm run start            # NODE_ENV=dev tsx src/index.ts — no watch
pnpm run watch            # NODE_ENV=dev tsx watch src/index.ts
pnpm run dev             # alias of `pnpm run watch`
pnpm run release:check 1.3.0  # validate a version against package.json
pnpm run release:preview  # print the changelog the next release would get
```

## Structure

- `src/index.ts` — the whole library in one file; `package.json` `exports` / `main` / `types` point
  at the built `dist/` output and `source` at this file.
- `test/index.test.ts` — the Vitest suite, mirroring the single source file.
- `scripts/` — release helpers used by the workflow: `check-release-version.mjs`, `release-notes.mjs`.
- `.github/workflows/` — `test.yml` (push/PR to `main`, Node 22: runs only `pnpm test --coverage`
  plus Codecov — no lint or types) and `release.yml` (manual, see below).

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint (`@antfu/eslint-config`) owns lint and formatting; `lint-staged` runs it per commit — run `pnpm run lint` before claiming a change clean.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- The `#src/*` alias (`package.json` `imports`) maps to `./src/*`; tests import it with a `.js` suffix.
- TSDoc on every exported function and option — the README and the jsDocs.io badge lean on it.

## How to work here

- **Check the callers before you change anything.** Grep who uses it and which tests name it. If the
  impact is unclear, say so — do not guess.
- **Never overwrite or delete a large section you have not understood.** Read it, or say what you could
  not determine and ask.
- **Do not invent requirements.** Build what was asked; surface what else you notice and let it be
  decided.
- **Fix the class, not the instance.** A copied helper, a rule stated twice, a guard bypassed by a
  second path is one problem: one implementation, one guard. That is the work, not a follow-up to ask
  for. Stay inside the task rather than refactoring the world.
- **Verify before claiming, and say what you checked.** A passing test is not evidence it pins
  anything — **break the thing it guards and watch it fail.** If it still passes, either the test is
  decoration or a different guard is running; find out which. Where a stub cannot answer the question,
  drive the real thing.
- **Never write an identifier from memory.** A commit hash, path, line number or version must be quoted
  from the source; a plausible-looking invented one is worse than none.
- **A stated blocker is a hypothesis, not a fact.** Re-test "cannot install X" / "tool unavailable"
  before inheriting it, and never report a failure your own flag forced.
- **Report the risk with the change** — correctness, security, operational and integration; plus what
  you could not verify and every assumption you made. An unverified claim marked as such beats a
  confident one that is wrong.
- **Missing recall of this repo?** Read this file, `.agentDocs/` and `git log` before acting, then ask
  1–3 focused questions rather than guessing at intent.
- This suite is timing-sensitive — ~32 bare `setTimeout` waits — so confirm a test can fail before trusting it.
- This is a published package: its consumer-visible surface is part of the risk — a rename or changed default reaches every consumer.

## Conciseness

**Prune verbose, keep correctness** — code, comments, docs alike.

- Code: a comment only for non-obvious *intent*, never to restate the line, and never long. A block
  arguing for its own change is a commit message.
- Docs: one idea per sentence. Cut anything that would not change what a reader does.
- Delete history `git log` already holds — keep the *rule* that came out of it, not the story.
- **Never drop a caveat to save a line.** Concise means no filler, not fewer facts.

## User-facing docs

`README.md` only — no `docs/` tree here, so do not invent one. Concise first read, samples that stay
runnable; docs ship in the same commit as the change, because the README is what npm shows.

## Releasing

Manual and version-first: dispatch **Actions → Release → Run workflow** with the version. `release.yml`
is the only publish path (a pushed tag publishes nothing), and `dry-run` still writes CHANGELOG.md,
bumps `package.json` and creates the local commit/tag on the runner — it only stops before the push,
GitHub release and npm publish. One-time trusted-publisher setup is in the README.

## Gotchas

- The timer store is a module-global keyed by `options.key`, defaulting to `callback.toString()`:
  callbacks with identical bodies share one timer, and the store persists across imports.
- `debounce(..., { leading: true })` only fires early on the first call — it forwards to `throttle`, whose timer then governs the window.
- `countdown`'s `replace` swaps the pending callback but keeps the original deadline; the timer is not restarted.
- While an async callback is in flight the key is marked `finishing`: further `debounce`/`throttle` calls only return a clearer and never run, and `getInstance(key)` exposes that state.
- `dist/` and `coverage/` are gitignored build output, never committed; ignored files do not trip the
  release workflow's `--clean` check, but untracked non-ignored files do.
- `engines.node >= 22`; the release workflow publishes on Node 24 while CI tests on Node 22.
