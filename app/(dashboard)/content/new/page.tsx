import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentForm } from "@/features/content/components/ContentForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Generar contenido | BPO AI" }

interface PageProps {
  searchParams: Promise<{ project_id?: string }>
}

export default async function NewContentPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project_id } = await searchParams

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name, sector, city, description, website), catalogs(catalog_items(name, status))")
    .eq("user_id", user.id)
    .in("status", ["pending", "in_progress", "review"])
    .order("created_at", { ascending: false })

  if (!projects || projects.length === 0) redirect("/projects/new")

  const normalized = (projects ?? []).map((p) => {
    const clients = Array.isArray(p.clients) ? p.clients[0] ?? null : p.clients
    const catalogs = (Array.isArray(p.catalogs) ? p.catalogs : p.catalogs ? [p.catalogs] : []) as { catalog_items: unknown }[]
    const catalogItemCount = catalogs.reduce((acc, c) => {
      const items = Array.isArray(c.catalog_items) ? c.catalog_items : c.catalog_items ? [c.catalog_items] : []
      return acc + (items as { status: string }[]).filter((i) => i.status !== "draft").length
    }, 0)
    return { id: p.id, name: p.name, clients, catalogItemCount }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generar contenido</h1>
        <p className="text-sm text-muted-foreground">
          Elige el tipo de contenido y la IA lo genera listo para usar en WhatsApp Business.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ContentForm projects={normalized as Parameters<typeof ContentForm>[0]["projects"]} defaultProjectId={project_id} />
      </div>
    </div>
  )
}
