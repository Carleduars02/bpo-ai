import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CatalogItemForm } from "@/features/catalogs/components/CatalogItemForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Agregar producto | BPO AI" }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewCatalogItemPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!catalog) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agregar producto</h1>
        <p className="text-sm text-muted-foreground">
          {catalog.name} — usa IA para generar descripción, beneficios y CTA automáticamente.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <CatalogItemForm mode="create" catalogId={id} />
      </div>
    </div>
  )
}
