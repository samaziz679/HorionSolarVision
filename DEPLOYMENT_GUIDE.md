# Deployment Guide for Solar Vision ERP

This guide provides instructions for deploying the Solar Vision ERP system to Vercel.

## Prerequisites

Before you begin, ensure you have:

1.  **A GitHub Account**: Your project repository should be hosted on GitHub.
2.  **A Vercel Account**: Sign up or log in at [vercel.com](https://vercel.com/).
3.  **A Supabase Project**: Your Supabase project should be set up with the correct schema and data. Refer to the `scripts/` directory for SQL scripts to set up your database.

## Deployment Steps

### 1. Link Your GitHub Repository to Vercel

1.  **Log in to Vercel**: Go to your Vercel dashboard.
2.  **Add New Project**: Click on "Add New..." and then "Project".
3.  **Import Git Repository**: Select "Import Git Repository" and choose your `solar-vision-erp` repository from GitHub. If you haven't connected your GitHub account, Vercel will prompt you to do so.

### 2. Configure Project Settings on Vercel

Once you've selected your repository, Vercel will take you to the project configuration screen.

1.  **Framework Preset**: Vercel should automatically detect Next.js. If not, select "Next.js" as the framework preset.
2.  **Root Directory**: Ensure the "Root Directory" is set correctly (usually the root of your repository, where `package.json` is located).
3.  **Build and Output Settings**:
    *   **Build Command**: `pnpm run build`
    *   **Install Command**: `pnpm install`
    *   **Output Directory**: `dist` (This is configured in `vercel.json`)
    *   **Development Command**: `pnpm run dev`
    (These commands are specified in your `vercel.json` and `package.json`.)

### 3. Set Up Environment Variables

This is a crucial step for connecting your Vercel deployment to your Supabase project.

1.  In the Vercel project settings, navigate to "Environment Variables".
2.  Add the following environment variables, replacing the placeholder values with your actual Supabase credentials:

    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://your-project-id.supabase.co`)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key (found in Supabase `Settings > API`)
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (found in Supabase `Settings > API` - **keep this secret and do not expose it on the client-side**)

    **Important**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are prefixed with `NEXT_PUBLIC_` as they are used on the client-side. `SUPABASE_SERVICE_ROLE_KEY` should *not* be prefixed with `NEXT_PUBLIC_` as it's for server-side use only.

### 4. Deploy Your Project

1.  After configuring the environment variables, click the "Deploy" button.
2.  Vercel will start building and deploying your application. You can monitor the deployment progress and view the build logs directly in the Vercel dashboard.

### 5. Post-Deployment Verification

1.  **Access Your Application**: Once the deployment is successful, Vercel will provide a unique URL for your application. Open this URL in your browser.
2.  **Test Functionality**:
    *   Verify the login flow using your Supabase user credentials.
    *   Navigate through the dashboard and other protected routes.
    *   Test all forms (e.g., adding clients, products, sales, expenses) to ensure data is correctly saved and retrieved from Supabase.
3.  **Review Build Logs**: If you encounter any issues, review the build logs on Vercel for errors or warnings.

## Troubleshooting Common Deployment Issues

*   **"Build Failed"**: Check the build logs on Vercel. Common issues include missing environment variables, incorrect `package.json` scripts, or syntax errors in your code.
*   **"500 Internal Server Error"**: This often indicates a runtime error. Check your serverless function logs on Vercel for more details. Ensure your database connection is correct and accessible from Vercel.
*   **Database Connection Issues**: Double-check your Supabase URL and keys in Vercel environment variables. Ensure your Supabase database allows connections from Vercel's IP ranges (though usually not required for standard Supabase setups).
*   **`pnpm-lock.yaml` mismatch**: If you get `ERR_PNPM_OUTDATED_LOCKFILE`, ensure your local `pnpm-lock.yaml` is up-to-date with your `package.json` by running `pnpm install` locally and committing both files before pushing to GitHub.

If you face persistent issues, you can always refer to the Vercel documentation or seek support from the Vercel community.
