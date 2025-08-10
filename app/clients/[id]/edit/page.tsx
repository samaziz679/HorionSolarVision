import { notFound } from "next/navigation"
import { fetchClientById } from "@/lib/data/clients"
import EditClientForm from "@/components/clients/edit-client-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: PageProps) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }
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
        <EditClientForm client={client} />
      </CardContent>
    </Card>
  )
}
