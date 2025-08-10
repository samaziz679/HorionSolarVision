# Vercel Repo Audit

Use this when the wrong repository or branch seems to be deploying, or builds unexpectedly fail.

## 1. Identity and source
- Project name: confirm it matches the app you expect.
- Settings → Git:
  - Connected repository is correct?
  - Production Branch is correct (e.g., `main`)?
  - Any ignored build step rules or monorepo settings present?

## 2. Root Directory
- If monorepo: Root Directory points at the Next.js app folder.
- If single app: Root Directory should be empty.

## 3. Install toolchain parity
- packageManager pinned? Look for `"packageManager": "pnpm@10.0.0"` in package.json.
- Node version pinned? Check `"engines.node": ">=18.18.0"`.
- Reinstall locally with the same versions (via Corepack).

## 4. Lockfile health
- Ensure `pnpm-lock.yaml` is committed and up-to-date:
  - `pnpm install` locally (with pnpm@10).
  - Commit `pnpm-lock.yaml`.
- Avoid the CI fallback `--no-frozen-lockfile` except for emergencies.

## 5. Environment parity
- Confirm ENV vars exist for Production, Preview, and Development if needed.
- If the app depends on browser-side env keys, they must start with `NEXT_PUBLIC_`.

## 6. SHA verification
- Local: `git rev-parse HEAD`
- GitHub: main branch latest commit
- Vercel: Deployment Details → commit SHA
- All three must match.

## 7. Build failures that hint repo mismatch
- Build logs show cloning a different repo/branch than expected.
- Old commits appear in deployments.
- ACTION: Disconnect/Connect the repo (Settings → Git), reselect repo, re-run deploy.

## 8. Temporary workarounds (use sparingly)
- Install Command: `pnpm install --no-frozen-lockfile`
- Rerun deploy without cache.
- If that works, fix the root cause (lockfile/versions) and remove workarounds.
