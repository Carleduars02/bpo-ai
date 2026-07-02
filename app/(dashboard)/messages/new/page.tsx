import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageForm } from "@/features/messages/components/MessageForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Generar mensajes | BPO AI" }

interface PageProps {
  searchParams: Promise<{ project_id?: string }>
}

export default async function NewMessageSetPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project_id } = await searchParams

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name, sector, city, description, website), catalogs(catalog_items(name, category, status))")
    .eq("user_id", user.id)
    .in("status", ["pending", "in_progress", "review"])
    .order("created_at", { ascending: false })

  if (!projects || projects.length === 0) {
    redirect("/projects/new")
  }

  const normalized = (projects ?? []).map((p) => {
    const clients = Array.isArray(p.clients) ? p.clients[0] ?? null : p.clients
    const catalogs = (Array.isArray(p.catalogs) ? p.catalogs : p.catalogs ? [p.catalogs] : []) as { catalog_items: unknown }[]
    const catalogItems = catalogs.flatMap((c) => {
      const items = Array.isArray(c.catalog_items) ? c.catalog_items : c.catalog_items ? [c.catalog_items] : []
      return items as { name: string; category: string | null; status: string }[]
    }).filter((i) => i.status !== "draft")

    return { id: p.id, name: p.name, clients, catalogItems }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generar mensajes</h1>
        <p className="text-sm text-muted-foreground">
          La IA creará mensajes de bienvenida, ausencia, respuestas rápidas y estados para WhatsApp Business.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <MessageForm projects={normalized} defaultProjectId={project_id} />
      </div>
    </div>
  )
}
