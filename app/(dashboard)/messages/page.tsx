import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus, MessageSquare, Calendar, Star, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Pagination } from "@/components/shared/Pagination"
import { getOne } from "@/lib/supabase/utils"

export const metadata: Metadata = { title: "Mensajes | BPO AI" }

const PAGE_SIZE = 20

const TONE_LABELS: Record<string, string> = {
  profesional:  "Profesional",
  cercano:      "Cercano y amigable",
  formal:       "Formal y corporativo",
  aspiracional: "Aspiracional y premium",
  divertido:    "Divertido y creativo",
}

interface PageProps {
  searchParams: Promise<{ view?: string; page?: string; project_id?: string }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { view: viewParam, page: pageParam, project_id: projectFilter } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("generated_content")
    .select("id, tone, created_at, projects(name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("content_type", "message_set")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (projectFilter) query = query.eq("project_id", projectFilter)

  const { data: sets, count: totalCount } = await query

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))
  const filteredProjectName = sets?.[0] ? (getOne(sets[0].projects) as { name: string } | null)?.name : null

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (viewParam) params.set("view", viewParam)
    if (projectFilter) params.set("project_id", projectFilter)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/messages?${qs}` : "/messages"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {projectFilter && (
        <Link href={`/projects/${projectFilter}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          Volver al proyecto
        </Link>
      )}
      <PageHero
        icon={MessageSquare}
        title={projectFilter && filteredProjectName ? `Mensajes — ${filteredProjectName}` : "Mensajes"}
        subtitle={`${totalCount ?? 0} set${(totalCount ?? 0) !== 1 ? "s" : ""} de mensajes generado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <>
            <Link href="/messages/favorites" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Star className="mr-2 h-4 w-4" />
              Guardados
            </Link>
            <Link href={`/messages/new${projectFilter ? `?project_id=${projectFilter}` : ""}`} className={buttonVariants({ size: "sm" })}>
              <Plus className="mr-2 h-4 w-4" />
              Generar mensajes
            </Link>
          </>
        }
      />

      {!sets || sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin mensajes generados todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Genera mensajes de bienvenida, ausencia y respuestas rápidas para WhatsApp Business.
          </p>
          <Link href="/messages/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Generar primeros mensajes
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <ViewToggle current={view} />
          </div>

          {view === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sets.map((set) => {
                const project = getOne(set.projects)
                const client  = getOne(set.clients)
                return (
                  <Link
                    key={set.id}
                    href={`/messages/${set.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(set.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {(client as { business_name: string } | null)?.business_name ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {(project as { name: string } | null)?.name}
                        {set.tone && (
                          <> · <span className="text-foreground/60">{TONE_LABELS[set.tone] ?? set.tone}</span></>
                        )}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Cliente</span>
                  <span>Proyecto</span>
                  <span>Tono</span>
                  <span>Fecha</span>
                </div>
                <div className="divide-y divide-border">
                  {sets.map((set) => {
                    const project = getOne(set.projects)
                    const client  = getOne(set.clients)
                    return (
                      <Link
                        key={set.id}
                        href={`/messages/${set.id}`}
                        className="grid grid-cols-[2fr_2fr_1.5fr_1fr] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/30"
                      >
                        <span className="truncate font-medium">
                          {(client as { business_name: string } | null)?.business_name ?? "—"}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {(project as { name: string } | null)?.name ?? "—"}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {set.tone ? TONE_LABELS[set.tone] ?? set.tone : "—"}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {new Date(set.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sets.map((set) => {
                const project = getOne(set.projects)
                const client  = getOne(set.clients)
                return (
                  <Link
                    key={set.id}
                    href={`/messages/${set.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40 hover:bg-card/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {(client as { business_name: string } | null)?.business_name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(project as { name: string } | null)?.name}
                          {set.tone && (
                            <> · <span className="text-foreground/60">{TONE_LABELS[set.tone] ?? set.tone}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(set.created_at).toLocaleDateString("es-ES")}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount ?? 0}
        pageSize={PAGE_SIZE}
        buildHref={buildHref}
      />
    </div>
  )
}
