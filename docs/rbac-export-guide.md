# RBAC Export Script Guide

## Overview

The `export:rbac` script (`scripts/export-rbac-metadata.mjs`) is a diagnostic tool that exports your RBAC configuration and database metadata to help troubleshoot permission and visibility issues.

## Prerequisites

**No additional integrations needed!** The script uses your existing Supabase integration.

The script requires:
1. The `pg` package (already installed in your project)
2. A Supabase database connection string (already configured)

## Environment Variables

The script automatically uses your existing Supabase environment variables:

- `SUPABASE_DB_URL` (preferred) - Direct database connection string
- `DATABASE_URL` (fallback) - Alternative database connection string

These are already configured in your Vercel project from the Supabase integration.

## Usage

### Basic Usage

Run the export script to generate a comprehensive RBAC report:

\`\`\`bash
npm run export:rbac
\`\`\`

This will create a file at `tmp/rbac-inspection-report.json` containing:

1. **Role Permissions** - All role configurations from `lib/auth/role-permissions.json`
2. **Database Metadata** - Table schemas, columns, and data types
3. **RLS Policies** - Row Level Security policies for each table
4. **Role Counts** - Number of users assigned to each role

### Inspect Specific Tables

By default, the script inspects these tables:
- `user_roles`
- `user_profiles`
- `company_settings`
- `sales`
- `products`

To inspect different tables, use the `--tables` flag:

\`\`\`bash
npm run export:rbac -- --tables=user_roles,clients,expenses
\`\`\`

## Output Format

The generated `rbac-inspection-report.json` file contains:

\`\`\`json
{
  "generatedAt": "2025-01-11T10:30:00.000Z",
  "rolePermissions": {
    "admin": {
      "modules": ["dashboard", "sales", "inventory", ...],
      "actions": ["create", "read", "update", "delete"]
    },
    ...
  },
  "databaseMetadata": {
    "connection": {
      "database": "your-db-name",
      "host": "aws-0-us-east-1.pooler.supabase.com",
      "user": "postgres.xxx",
      "usingSupabaseDbUrl": true
    },
    "tablesInspected": ["user_roles", "user_profiles", ...],
    "columns": [...],
    "policies": [...],
    "roleCounts": [
      { "role": "admin", "total": "2" },
      { "role": "manager", "total": "5" },
      ...
    ]
  }
}
\`\`\`

## Troubleshooting

### Missing Database Connection

If you see the error:
\`\`\`
Set SUPABASE_DB_URL (preferred) or DATABASE_URL with your Supabase connection string
\`\`\`

This means the environment variable is not set. To fix:

1. Go to your Vercel project settings
2. Navigate to the "Vars" section in the v0 sidebar
3. Add `SUPABASE_DB_URL` with your Supabase connection string

The connection string format is:
\`\`\`
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
\`\`\`

You can find this in your Supabase project settings under "Database" → "Connection string" → "Connection pooling".

### Voice Assistant Not Visible

If the voice assistant is not showing up in the sidebar:

1. Run the export script: `npm run export:rbac`
2. Check the `rolePermissions` section in the output
3. Verify that your role includes `"voice_assistant"` in the `modules` array
4. Check the `roleCounts` to see how many users have each role
5. Verify your user's role in the `user_roles` table

### RLS Policy Issues

If users can't access certain data:

1. Run the export script with the relevant tables: `npm run export:rbac -- --tables=sales,products`
2. Check the `policies` section in the output
3. Verify that RLS policies exist for the tables
4. Check that the policies allow access for your user's role

## Common Use Cases

### Debugging Voice Assistant Visibility

\`\`\`bash
# Export RBAC data
npm run export:rbac

# Check the output file
cat tmp/rbac-inspection-report.json | grep -A 10 "voice_assistant"
\`\`\`

### Verifying User Roles

\`\`\`bash
# Export with user_roles table
npm run export:rbac -- --tables=user_roles

# Check role counts in the output
\`\`\`

### Inspecting RLS Policies

\`\`\`bash
# Export with specific tables
npm run export:rbac -- --tables=sales,products,clients

# Review the policies section in the output
\`\`\`

## Integration with v0

When reporting issues to v0, you can:

1. Run the export script
2. Attach the `tmp/rbac-inspection-report.json` file to your message
3. v0 can analyze the report to identify permission issues

This helps v0 understand your exact RBAC configuration and database state without needing to guess.
