import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ClientForm } from "@/features/clients/components/ClientForm"
import type { Metadata } from "next"
import type { ClientFormValues } from "@/features/clients/schemas/client.schema"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from("clients").select("business_name").eq("id", id).single()
  return { title: data ? `Editar ${data.business_name} | BPO AI` : "Editar cliente | BPO AI" }
}

export default async function EditClientPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!client) notFound()

  const defaultValues: Partial<ClientFormValues> = {
    business_name: client.business_name,
    owner_name: client.owner_name ?? undefined,
    sector: client.sector,
    description: client.description ?? undefined,
    city: client.city ?? undefined,
    website: client.website ?? undefined,
    whatsapp_phone: client.whatsapp_phone ?? undefined,
    email: client.email ?? undefined,
    whatsapp_link: client.whatsapp_link ?? undefined,
    status: client.status as "active" | "potential" | "archived",
    source: client.source ?? undefined,
    price: client.price ? Number(client.price) : undefined,
    notes: client.notes ?? undefined,
    next_followup: client.next_followup ?? undefined,
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar cliente</h1>
        <p className="text-sm text-muted-foreground">{client.business_name}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ClientForm mode="edit" clientId={id} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
