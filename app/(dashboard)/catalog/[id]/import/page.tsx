import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { BulkImporter } from "@/features/catalogs/components/BulkImporter"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("catalogs").select("name").eq("id", id).single()
  return { title: data ? `Importar productos — ${data.name} | BPO AI` : "Importar | BPO AI" }
}

export default async function CatalogImportPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id, name, clients(business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!catalog) notFound()

  const client = Array.isArray(catalog.clients) ? catalog.clients[0] : catalog.clients

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={`/catalog/${id}`}
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {catalog.name}
        </Link>
        <h1 className="text-2xl font-bold">Importar productos en masa</h1>
        <p className="text-sm text-muted-foreground">
          {(client as { business_name: string } | null)?.business_name} · Pega una lista o sube un archivo CSV/Excel
        </p>
      </div>

      <BulkImporter catalogId={id} catalogName={catalog.name} />
    </div>
  )
}
