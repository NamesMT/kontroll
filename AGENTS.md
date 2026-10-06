# AGENTS.md

`kontroll` ("control") is a tiny, ESM-only TypeScript library of function-behavior controls —
`debounce`, `countdown`, `throttle` (limit) — plus `clear` and `getInstance`. Node >= 22, zero
dependencies, built with [tsdown](https://github.com/rolldown/tsdown), tested with
[Vitest](https://vitest.dev); published to npm as `kontroll`.

## Commands

```sh
pnpm run lint             # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test             # vitest watch; `pnpm exec vitest run` for a one-shot
pnpm run test:types       # tsc --noEmit --skipLibCheck
pnpm run check            # lint + test:types + vitest run --coverage — the release gate
pnpm run build            # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm run dev              # tsx watch src/index.ts
pnpm run release:check 1.3.0  # validate a version against package.json
pnpm run release:preview  # print the changelog the next release would get
```

## Structure

- `src/index.ts` — the whole library in one file; `package.json` `exports` / `main` / `types` point
  at the built `dist/` output and `source` at this file.
- `test/index.test.ts` — the Vitest suite, mirroring the single source file.
- `tsdown.config.ts`, `vitest.config.ts`, `eslint.config.js` — build, test and lint config.
- `scripts/` — release helpers used by the workflow: `check-release-version.mjs`, `release-notes.mjs`.
- `.github/workflows/` — `test.yml` (push/PR to `main`, Node 22: runs only `pnpm test --coverage`
  plus Codecov — no lint or types) and `release.yml` (manual, see below).

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint via `@antfu/eslint-config` owns formatting (no Prettier, single quotes, 2-space indent);
  `lint-staged` runs plain `eslint` per commit — run `pnpm run lint` before claiming a change clean.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- The `#src/*` alias (`package.json` `imports`) maps to `./src/*`; tests import it with a `.js` suffix.
- TSDoc on every exported function and option — the README and the jsDocs.io badge lean on it.

## How to work here

- Check who calls it (grep `src/`, `test/`) before changing it; say when impact is unclear rather than
  guessing, and surface what looks needed instead of inventing requirements.
- Never overwrite or delete a large section you have not understood.
- Report the risk, not only the change — correctness, integration, and a published package's
  consumer-visible surface. Mark anything unverified as unverified.
- **Fix the root cause, not the instance.** A bug back under a new name — a copied helper, a rule stated
  twice, a guard bypassed by a second path — is a class: fix it with one implementation, one guard.
  That is the work, not a follow-up to ask for.
- Verify before claiming, and say which direction you checked. A passing test is not evidence it pinned
  anything — this suite is timing-sensitive, so confirm a test can fail before trusting it.
- If recall of this project is missing, read this file and `git log` before acting.

## Conciseness (applies everywhere)

Prune verbose, keep correctness — code, comments, docs. Code: a comment only for non-obvious intent.
Docs: one idea per sentence; cut what would not change what a reader does. `git log` already holds the
history — keep the rule, not the story. Never drop a caveat to save a line.

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
