# SHA Comparison Steps

Goal: Confirm Vercel is deploying the commit you expect.

## 1) Get local SHA
\`\`\`bash
git rev-parse HEAD
\`\`\`

## 2) Get GitHub main HEAD SHA
- Open your repo on GitHub → Branch: main → copy the latest commit SHA (7 characters are enough to compare with Vercel).

## 3) Get Vercel deployed SHA
- Vercel Dashboard → Project → Deployments → open the deployment → look for “Commit: <sha>”.

## 4) Compare
- All three SHAs (local, GitHub, Vercel) should match.
- If GitHub and Vercel match but local differs: you haven’t pushed.
- If local and GitHub match but Vercel differs: wrong repo/branch is linked, or a different deployment was promoted.

## 5) Fixes
- Push missing commits:
  \`\`\`bash
  git push origin main
  \`\`\`
- Re-link the correct repo in Vercel:
  - Settings → Git → Disconnect → Connect Git Repository → select the correct repo.
- Re-run the deployment (or push a no-op commit) and verify SHAs again.
