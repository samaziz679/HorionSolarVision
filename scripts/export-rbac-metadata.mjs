#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outputDir = path.resolve(process.cwd(), "tmp")
const outputPath = path.join(outputDir, "rbac-inspection-report.json")

async function loadRolePermissions() {
  const rolePermissionsPath = path.resolve(__dirname, "../lib/auth/role-permissions.json")
  const raw = await readFile(rolePermissionsPath, "utf8")
  return JSON.parse(raw)
}

async function loadPgClient() {
  try {
    const pg = await import("pg")
    return pg.Client
  } catch (error) {
    throw new Error(
      "The `pg` package is required. Install it with `pnpm add -D pg` (or the equivalent for your package manager) before running export:rbac.",
    )
  }
}

function getTablesFromArgs() {
  const tablesArg = process.argv.find((arg) => arg.startsWith("--tables="))
  if (!tablesArg) {
    return ["user_roles", "user_profiles", "company_settings", "sales", "products"]
  }
  const [, value] = tablesArg.split("=")
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

async function fetchDatabaseMetadata(tables) {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!connectionString) {
    return {
      error: "Set SUPABASE_DB_URL (preferred) or DATABASE_URL with your Supabase connection string to collect database metadata.",
    }
  }

  const PgClient = await loadPgClient()
  const client = new PgClient({ connectionString })
  await client.connect()

  try {
    const columnsQuery = `
      SELECT
        table_schema,
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema IN ('public', 'auth')
        AND ($1::text[] IS NULL OR table_name = ANY($1::text[]))
      ORDER BY table_schema, table_name, ordinal_position;
    `

    const policiesQuery = `
      SELECT
        schemaname,
        tablename,
        policyname,
        roles,
        cmd,
        permissive,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname IN ('public', 'auth')
        AND ($1::text[] IS NULL OR tablename = ANY($1::text[]))
      ORDER BY schemaname, tablename, policyname;
    `

    const roleCountsQuery = `
      SELECT role, COUNT(*) AS total
      FROM public.user_roles
      GROUP BY role
      ORDER BY role;
    `

    const tableArray = tables.length > 0 ? tables : null

    const [columnsResult, policiesResult, roleCountsResult] = await Promise.all([
      client.query(columnsQuery, [tableArray]),
      client.query(policiesQuery, [tableArray]),
      client.query(roleCountsQuery),
    ])

    const { database, host, user } = client.connectionParameters

    return {
      connection: {
        database,
        host,
        user,
        usingSupabaseDbUrl: Boolean(process.env.SUPABASE_DB_URL),
      },
      tablesInspected: tables,
      columns: columnsResult.rows,
      policies: policiesResult.rows,
      roleCounts: roleCountsResult.rows,
    }
  } finally {
    await client.end()
  }
}

async function main() {
  const rolePermissions = await loadRolePermissions()
  const tables = getTablesFromArgs()
  const databaseMetadata = await fetchDatabaseMetadata(tables)

  await mkdir(outputDir, { recursive: true })
  const payload = {
    generatedAt: new Date().toISOString(),
    rolePermissions,
    databaseMetadata,
  }

  await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8")

  console.log(`RBAC report saved to ${outputPath}`)
  if (databaseMetadata.error) {
    console.warn(databaseMetadata.error)
  } else {
    console.log(
      `Tables captured: ${databaseMetadata.tablesInspected.join(", ") || "none"}. Rows per role:`,
      databaseMetadata.roleCounts,
    )
  }
}

main().catch((error) => {
  console.error("Failed to export RBAC metadata:", error)
  process.exitCode = 1
})
