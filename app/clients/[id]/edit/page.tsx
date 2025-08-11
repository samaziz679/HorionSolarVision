import { notFound } from "next/navigation"
import { fetchClientById } from "@/lib/data/clients"
import { ClientForm } from "@/components/clients/client-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = params
  const client = await fetchClientById(id)

  if (!client) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Client</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientForm client={client} />
      </CardContent>
    </Card>
  )
}
