import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PROJECT_STATUSES } from "@/constants/navigation"
import { Plus, FolderOpen } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Pagination } from "@/components/shared/Pagination"
import { ProjectsList } from "@/features/projects/components/ProjectsList"

export const metadata: Metadata = { title: "Proyectos | BPO AI" }

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; created?: string; view?: string; page?: string }>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { q, status, created, view: viewParam, page: pageParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("projects")
    .select("id, name, status, service_type, delivery_date, created_at, clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(`name.ilike.%${q}%,objective.ilike.%${q}%`)
  }
  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data: projects, count: totalCount } = await query

  const activeStatus = status ?? "all"
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status) params.set("status", status)
    if (viewParam) params.set("view", viewParam)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/projects?${qs}` : "/projects"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        icon={FolderOpen}
        title="Proyectos"
        subtitle={`${totalCount ?? 0} proyecto${(totalCount ?? 0) !== 1 ? "s" : ""} registrado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href="/projects/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </Link>
        }
      />

      {created === "1" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Proyecto creado correctamente.
        </div>
      )}

      {/* Búsqueda */}
      <form method="GET" className="relative">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre u objetivo…"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pl-10 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        {status && <input type="hidden" name="status" value={status} />}
      </form>

      {/* Filtros por estado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[{ value: "all", label: "Todos" }, ...PROJECT_STATUSES].map((s) => (
            <Link
              key={s.value}
              href={`/projects?${q ? `q=${q}&` : ""}${s.value !== "all" ? `status=${s.value}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeStatus === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <ViewToggle current={view} />
      </div>

      {/* Lista */}
      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin proyectos todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">Crea tu primer proyecto para empezar a optimizar perfiles.</p>
          <Link href="/projects/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </Link>
        </div>
      ) : (
        <ProjectsList projects={projects} view={view} />
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
