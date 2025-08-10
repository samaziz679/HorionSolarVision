import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SetupRequiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            It looks like your Supabase database schema is not fully set up.
          </p>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Please ensure you have run all the SQL scripts in the `scripts/` directory
            of your project to initialize the database tables and policies.
          </p>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Steps to Resolve:</h3>
            <ol className="list-decimal list-inside text-left mx-auto max-w-xs text-gray-600 dark:text-gray-400">
              <li>Open your Supabase project dashboard.</li>
              <li>Navigate to the SQL Editor.</li>
              <li>Execute the SQL scripts from your project's `scripts/` folder in order:
                <ul className="list-disc list-inside ml-4">
                  <li>`supabase_schema.sql`</li>
                  <li>`complete_supabase_schema.sql`</li>
                  <li>`complete_supabase_schema_corrected.sql`</li>
                  <li>`complete_supabase_schema_final_correction.sql`</li>
                  <li>`complete_supabase_schema_final_correction_v2.sql`</li>
                  <li>`insert_initial_stock.sql` (Remember to replace `YOUR_USER_ID`)</li>
                  <li>`insert_initial_stock_corrected.sql` (Remember to replace `YOUR_ACTUAL_USER_ID`)</li>
                </ul>
              </li>
              <li>After running the scripts, refresh this page.</li>
            </ol>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Refresh Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
