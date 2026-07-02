import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuditForm } from "@/features/audits/components/AuditForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nueva auditoría | BPO AI" }

interface PageProps {
  searchParams: Promise<{ project_id?: string }>
}

export default async function NewAuditPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project_id } = await searchParams

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name, sector, description, website, whatsapp_link)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!projects || projects.length === 0) {
    redirect("/projects/new")
  }

  const projectIds = (projects ?? []).map((p) => p.id)

  const [{ data: catalogs }, { data: messageSets }] = await Promise.all([
    supabase
      .from("catalogs")
      .select("id, project_id")
      .in("project_id", projectIds),
    supabase
      .from("generated_content")
      .select("project_id, raw_output, created_at")
      .eq("content_type", "message_set")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false }),
  ])

  const catalogIds = (catalogs ?? []).map((c) => c.id)
  const { data: catalogItems } = catalogIds.length
    ? await supabase.from("catalog_items").select("catalog_id").in("catalog_id", catalogIds)
    : { data: [] }

  const catalogItemCountByCatalog: Record<string, number> = {}
  for (const item of catalogItems ?? []) {
    catalogItemCountByCatalog[item.catalog_id] = (catalogItemCountByCatalog[item.catalog_id] ?? 0) + 1
  }

  const catalogProductCountByProject: Record<string, number> = {}
  for (const c of catalogs ?? []) {
    catalogProductCountByProject[c.project_id] =
      (catalogProductCountByProject[c.project_id] ?? 0) + (catalogItemCountByCatalog[c.id] ?? 0)
  }

  const messageSetByProject: Record<string, { hasWelcomeMessage: boolean; hasAwayMessage: boolean; quickRepliesCount: number }> = {}
  for (const m of messageSets ?? []) {
    if (messageSetByProject[m.project_id]) continue // ya tenemos el más reciente (ordenado desc)
    try {
      const parsed = JSON.parse(m.raw_output) as { output?: { welcome_messages?: unknown[]; away_message?: string; quick_replies?: unknown[] } }
      messageSetByProject[m.project_id] = {
        hasWelcomeMessage: Array.isArray(parsed.output?.welcome_messages) && parsed.output.welcome_messages.length > 0,
        hasAwayMessage:    typeof parsed.output?.away_message === "string" && parsed.output.away_message.trim().length > 0,
        quickRepliesCount: Array.isArray(parsed.output?.quick_replies) ? parsed.output.quick_replies.length : 0,
      }
    } catch {
      // raw_output inesperado — se omite, el auditor puede completarlo a mano
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa los datos del perfil para que la IA genere el análisis completo.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <AuditForm
          projects={(projects ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            clients: Array.isArray(p.clients) ? p.clients[0] ?? null : p.clients,
            catalogProductCount: catalogProductCountByProject[p.id] ?? 0,
            messageSet: messageSetByProject[p.id] ?? null,
          })) as Parameters<typeof AuditForm>[0]["projects"]}
          defaultProjectId={project_id}
        />
      </div>
    </div>
  )
}
