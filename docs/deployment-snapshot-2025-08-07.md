# Production deployment snapshot — 2025-08-07

This snapshot documents a Production deployment of the Vercel project for Solar Vision ERP.

![Deployment details](/docs/vercel-deployment-details-2025-08-07.png)

What this screenshot confirms:
- Project: solar-vision-burkina-erp
- Environment: Production
- Status at capture time: Building
- Source branch: `main`
- Commit (short SHA): `9441ffd` (linked in Vercel UI)
- Repository shown in logs: `github.com/samaziz679/solar-vision-burkina-erp`
- Domains: Vercel-provided URLs visible under "Domains"

Suggested next checks:
1) Compare SHAs using the steps in `docs/sha-comparison-steps.md` to ensure the Production deployment commit matches GitHub `origin/main` and local `HEAD`.  
2) Once the deployment completes, open the production domain and run a quick smoke test (login, navigate dashboard, CRUD ops).  
3) If using Supabase OAuth, ensure the production domain is listed in Supabase Redirect URLs.
