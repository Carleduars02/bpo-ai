import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CatalogItemForm } from "@/features/catalogs/components/CatalogItemForm"
import type { Metadata } from "next"
import type { CatalogItemFormValues } from "@/features/catalogs/schemas/catalog.schema"

export const metadata: Metadata = { title: "Editar producto | BPO AI" }

interface PageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default async function EditCatalogItemPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id, itemId } = await params

  const [{ data: catalog }, { data: item }] = await Promise.all([
    supabase.from("catalogs").select("id, name").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("catalog_items").select("*").eq("id", itemId).eq("user_id", user.id).single(),
  ])

  if (!catalog || !item) notFound()

  const benefits = Array.isArray(item.benefits) ? (item.benefits as string[]).join("\n") : ""
  const keywords = Array.isArray(item.keywords) ? (item.keywords as string[]).join(", ") : ""

  const defaultValues: Partial<CatalogItemFormValues> = {
    name:        item.name,
    category:    item.category ?? undefined,
    description: item.description ?? undefined,
    benefits:    benefits || undefined,
    cta:         item.cta ?? undefined,
    keywords:    keywords || undefined,
    price:       item.price ?? undefined,
    currency:    item.currency ?? "USD",
    image_url:   item.image_url ?? undefined,
    status:      (item.status as "active" | "draft") ?? "active",
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar producto</h1>
        <p className="text-sm text-muted-foreground">{item.name} · {catalog.name}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <CatalogItemForm
          mode="edit"
          catalogId={id}
          itemId={itemId}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
