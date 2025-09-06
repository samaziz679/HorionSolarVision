# Archive Old Development Scripts

To clean up the scripts directory, you can move the old development scripts to an archive folder:

\`\`\`bash
mkdir scripts/archive
mv scripts/add_*.sql scripts/archive/
mv scripts/check_*.sql scripts/archive/
mv scripts/complete_database_schema.sql scripts/archive/
mv scripts/complete_supabase_schema*.sql scripts/archive/
mv scripts/cleanup_*.sql scripts/archive/
mv scripts/create_*.sql scripts/archive/
mv scripts/fix_*.sql scripts/archive/
mv scripts/migrate_*.sql scripts/archive/
\`\`\`

Keep only:
- `00_fresh_install_complete.sql`
- `README.md`
- Any future migration scripts
