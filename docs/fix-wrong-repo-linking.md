# Fix: Project linked to the wrong GitHub repository (Vercel)

Use this checklist to rewire your Vercel project to the correct repo with minimal downtime.

## A) Update Vercel project to the correct repository (UI)

1. Vercel → Project → Settings → Git
   - If "Git Repository" is incorrect:
     - Click **Disconnect**
     - Click **Connect Git Repository**
     - Pick the correct **owner/repo**
     - Save

2. If your repo isn’t listed:
   - Click **Manage** next to your Git provider (GitHub)
   - Grant access to the specific repository (or all repositories)
   - Return to Settings → Git → **Connect Git Repository** again

3. Production branch
   - Vercel → Project → Settings → **Production** → Branch Tracking → set to `main` (or your chosen branch)

4. Monorepo / subfolder app (if applicable)
   - Vercel → Project → Settings → General → Build & Development Settings
   - **Root Directory** → set to the folder containing your Next.js app (leave empty if at repo root)

5. Save, then push a commit to the tracked branch to trigger a deployment.
   - Open Deployments → latest deployment → confirm it shows:
     - Source: `main` (or your branch)
     - The correct GitHub repo and commit SHA (clickable link)

## B) Fix your local git remote and branch (CLI)

From your project folder:

\`\`\`bash
# 1) Verify current remotes
git remote -v

# 2) Point origin to the correct GitHub repository
git remote set-url origin https://github.com/<owner>/<repo>.git

# 3) Ensure you're on main and push
git checkout -B main
git push -u origin main
\`\`\`

## C) Link your local folder to the Vercel project (CLI)

\`\`\`bash
# 1) Link local folder to the intended Vercel project
npx vercel link

# 2) Pull project settings and env vars
npx vercel pull
\`\`\`

This creates/updates `.vercel/project.json` so your CLI deploys go to the exact same Vercel project that’s Git-connected.

## D) Validate the commit SHA matches

1. GitHub `main` HEAD:
   \`\`\`bash
   git fetch origin
   git rev-parse --short origin/main
   \`\`\`
2. Local HEAD:
   \`\`\`bash
   git rev-parse --short HEAD
   \`\`\`
3. Vercel:
   - Project → Deployments → open latest Production deployment
   - Copy the short SHA next to “Source: main”

All three should match. If not, push to `main` or redeploy the desired commit in Vercel Deployments.

## E) Optional: safer “clean project” approach

If you’d rather not touch the existing project:
1. Create a **new Vercel project** → “Import Git Repository” → select the correct repo
2. Configure Root Directory and Production branch
3. Verify builds and app behavior
4. Move domains from the old project to the new one (Project → Settings → Domains)

## Troubleshooting

- Repo still doesn’t appear during “Connect Git Repository”:
  - GitHub → Settings → Integrations → GitHub Apps → **Vercel** → Configure → select the repo
- Builds not triggering on push:
  - Ensure Production Branch matches `main` (or your chosen branch)
  - Check the “Ignored Build Step” setting is empty (Settings → Git)
- Wrong folder building in monorepo:
  - Set **Root Directory** to the app’s subfolder
