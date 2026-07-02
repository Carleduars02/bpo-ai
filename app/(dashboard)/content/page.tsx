import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus, Wand2, Calendar, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { Pagination } from "@/components/shared/Pagination"
import { getOne } from "@/lib/supabase/utils"
import { CONTENT_FORMAT_OPTIONS, type ContentFormat } from "@/features/content/schemas/content.schema"

export const metadata: Metadata = { title: "Contenido IA | BPO AI" }

const PAGE_SIZE = 20

const TONE_LABELS: Record<string, string> = {
  profesional:  "Profesional",
  cercano:      "Cercano",
  formal:       "Formal",
  aspiracional: "Aspiracional",
  divertido:    "Divertido",
}

const FORMAT_LABELS: Record<ContentFormat, string> = Object.fromEntries(
  CONTENT_FORMAT_OPTIONS.map((o) => [o.value, o.label])
) as Record<ContentFormat, string>

function formatOf(rawOutput: string): ContentFormat {
  try {
    const parsed = JSON.parse(rawOutput) as { format?: ContentFormat }
    return parsed.format ?? "profile"
  } catch {
    return "profile"
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string; project_id?: string }>
}

export default async function ContentPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { page: pageParam, project_id: projectFilter } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("generated_content")
    .select("id, tone, created_at, raw_output, projects(id, name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("content_type", "profile_content")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (projectFilter) query = query.eq("project_id", projectFilter)

  const { data: records, count: totalCount } = await query

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))
  const filteredProjectName = records?.[0] ? (getOne(records[0].projects) as { name: string } | null)?.name : null

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (projectFilter) params.set("project_id", projectFilter)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/content?${qs}` : "/content"
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
        icon={Wand2}
        title={projectFilter && filteredProjectName ? `Contenido — ${filteredProjectName}` : "Contenido IA"}
        subtitle={`${totalCount ?? 0} contenido${(totalCount ?? 0) !== 1 ? "s" : ""} generado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href={`/content/new${projectFilter ? `?project_id=${projectFilter}` : ""}`} className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Generar contenido
          </Link>
        }
      />

      {!records || records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Wand2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin contenido generado todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Genera contenido de perfil, posts para Estado, promociones y anuncios de temporada con IA.
          </p>
          <Link href="/content/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Generar primer contenido
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const project = getOne(record.projects)
            const client  = getOne(record.clients)
            const format  = formatOf(record.raw_output)

            return (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Wand2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {(client as { business_name: string } | null)?.business_name ?? "Sin cliente"}
                      </p>
                      <span className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        {FORMAT_LABELS[format]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(project as { name: string } | null)?.name}
                      {record.tone && (
                        <> · <span className="text-foreground/70">{TONE_LABELS[record.tone] ?? record.tone}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(record.created_at).toLocaleDateString("es-ES")}
                  </span>
                  <Link
                    href={`/content/${record.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Ver
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
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
