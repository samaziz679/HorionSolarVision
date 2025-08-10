import { fetchBankingAccounts } from '@/lib/data/banking';
import BankingList from '@/components/banking/banking-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default async function BankingPage() {
  const bankingAccounts = await fetchBankingAccounts();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Banking Accounts</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild className="ml-auto">
          <Link href="/banking/new">Add New Account</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Banking Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <BankingList bankingAccounts={bankingAccounts} />
        </CardContent>
      </Card>
    </main>
  );
}
