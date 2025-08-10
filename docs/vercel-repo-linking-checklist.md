# Vercel Repo Linking Checklist

Goal: Ensure this Vercel project deploys from the correct Git repository, branch, and directory.

1) Confirm the linked repository
- Vercel Dashboard → Project → Settings → Git
- “Connected to” should show the correct <owner>/<repo>.
- If wrong: Click Disconnect → Connect Git Repository → pick the correct repo.
- If the repo isn’t listed: Click Manage next to the Git provider → grant access to the target repository → try Connect again.

2) Production branch
- Settings → Git → Production Branch → set to `main` (or your chosen branch).
- If your repo’s default is `master`, set Production Branch to `master` here.

3) Root Directory (monorepo or subfolder)
- Settings → General → Build & Development Settings → Root Directory.
- Leave empty for a single-app repo. Set to the app folder for monorepos (e.g., `apps/web`).

4) Install and build commands
- Usually blank so Vercel auto-detects Next.js.
- If needed (temporary workaround): set Install Command to `pnpm install --no-frozen-lockfile`.
- Leave Build Command empty or set `next build`.

5) Environment variables
- Settings → Environment Variables
- Add required keys (e.g., Supabase):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
- Re-run the deployment after changes.

6) Verify SHA alignment
- After a deploy, compare the commit SHA in:
  - GitHub (main HEAD)
  - Vercel → Deployment Details
  - Local `git rev-parse HEAD`
- All three should match.

7) Permissions sanity check
- In your Git provider, ensure the Vercel GitHub App has access to the selected repo.
- If your org uses SSO/restrictions, approve the app for the org and repo.
