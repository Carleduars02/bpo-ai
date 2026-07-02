import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus, FileText, Calendar, Download } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { Pagination } from "@/components/shared/Pagination"
import { getOne } from "@/lib/supabase/utils"

export const metadata: Metadata = { title: "Reportes PDF | BPO AI" }

const PAGE_SIZE = 20

const SECTION_LABELS: Record<string, string> = {
  executive_summary: "Resumen",
  diagnosis:         "Diagnóstico",
  recommendations:   "Plan de acción",
  messages:          "Mensajes",
  catalog:           "Catálogo",
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: reports, count: totalCount } = await supabase
    .from("reports")
    .select("id, title, status, sections, generated_at, created_at, projects(name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/reports?${qs}` : "/reports"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        icon={FileText}
        title="Reportes PDF"
        subtitle={`${totalCount ?? 0} informe${(totalCount ?? 0) !== 1 ? "s" : ""} creado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href="/reports/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo informe
          </Link>
        }
      />

      {!reports || reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin informes todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Genera un PDF profesional con el diagnóstico y las mejoras del proyecto.
          </p>
          <Link href="/reports/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Crear primer informe
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const project  = getOne(report.projects)
            const client   = getOne(report.clients)
            const sections = Array.isArray(report.sections) ? report.sections as string[] : []

            return (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    report.status === "generated" ? "bg-green-500/10" : "bg-primary/10"
                  }`}>
                    <FileText className={`h-4 w-4 ${report.status === "generated" ? "text-green-400" : "text-primary"}`} />
                  </div>
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(client as { business_name: string } | null)?.business_name}
                      {(project as { name: string } | null)?.name && (
                        <> · {(project as { name: string }).name}</>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sections.map((s) => (
                        <span key={s} className="rounded-sm border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {SECTION_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString("es-ES")}
                  </span>
                  <Link
                    href={`/reports/${report.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    {report.status === "generated" ? (
                      <>
                        <Download className="mr-1.5 h-3 w-3" />
                        Descargar
                      </>
                    ) : "Ver"}
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
