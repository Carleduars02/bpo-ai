import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ImageUploader } from "@/features/images/components/ImageUploader"
import { ImageGallery } from "@/features/images/components/ImageGallery"
import { ProjectFilterSelect } from "@/features/images/components/ProjectFilterSelect"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { Pagination } from "@/components/shared/Pagination"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Image as ImageIcon, Search } from "lucide-react"

export const metadata: Metadata = { title: "Imágenes | BPO AI" }

const PAGE_SIZE = 40

const TYPE_LABELS: Record<string, string> = {
  all:     "Todas",
  logo:    "Logos",
  cover:   "Portadas",
  product: "Productos",
  profile: "Perfiles",
  other:   "Otras",
}

interface PageProps {
  searchParams: Promise<{ type?: string; project?: string; q?: string; view?: string; page?: string }>
}

export default async function ImagesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { type: typeFilter, project: projectFilter, q, view: viewParam, page: pageParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Build query
  let query = supabase
    .from("media")
    .select("id, file_name, original_url, file_size, mime_type, width, height, media_type, created_at, projects(id, name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (typeFilter && typeFilter !== "all") {
    query = query.eq("media_type", typeFilter)
  }
  if (projectFilter) {
    query = query.eq("project_id", projectFilter)
  }
  if (q) {
    query = query.ilike("file_name", `%${q}%`)
  }

  const [{ data: images, count: totalCount }, { data: projects }] = await Promise.all([
    query,
    supabase
      .from("projects")
      .select("id, name, clients(business_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (typeFilter) params.set("type", typeFilter)
    if (projectFilter) params.set("project", projectFilter)
    if (q) params.set("q", q)
    if (viewParam) params.set("view", viewParam)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/images?${qs}` : "/images"
  }

  function buildFilterHref(overrides: { type?: string; project?: string }) {
    const params = new URLSearchParams()
    const nextType    = overrides.type !== undefined ? overrides.type : typeFilter
    const nextProject = overrides.project !== undefined ? overrides.project : projectFilter
    if (nextType && nextType !== "all") params.set("type", nextType)
    if (nextProject) params.set("project", nextProject)
    if (q) params.set("q", q)
    if (viewParam) params.set("view", viewParam)
    const qs = params.toString()
    return qs ? `/images?${qs}` : "/images"
  }

  const normalizedProjects = (projects ?? []).map((p) => ({
    id:      p.id,
    name:    p.name,
    clients: Array.isArray(p.clients)
      ? (p.clients[0] as { business_name: string } | null)
      : (p.clients as { business_name: string } | null),
  }))

  const normalizedImages = (images ?? []).map((img) => ({
    ...img,
    projects: Array.isArray(img.projects) ? img.projects[0] ?? null : img.projects,
    clients:  Array.isArray(img.clients)  ? img.clients[0]  ?? null : img.clients,
  })) as Parameters<typeof ImageGallery>[0]["images"]

  const activeType = typeFilter ?? "all"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero
        icon={ImageIcon}
        title="Imágenes"
        subtitle={`${totalCount ?? 0} imagen${(totalCount ?? 0) !== 1 ? "es" : ""} almacenada${(totalCount ?? 0) !== 1 ? "s" : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: filter + gallery */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search + project filter + view toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <form className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por nombre de archivo…"
                  className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
              {projectFilter && <input type="hidden" name="project" value={projectFilter} />}
              {viewParam && <input type="hidden" name="view" value={viewParam} />}
            </form>

            <ProjectFilterSelect
              projects={normalizedProjects}
              value={projectFilter ?? ""}
              currentParams={{ type: typeFilter, q, view: viewParam }}
            />

            <ViewToggle current={view} />
          </div>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <a
                key={value}
                href={buildFilterHref({ type: value === "all" ? undefined : value })}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  activeType === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <ImageGallery images={normalizedImages} view={view} hasFilters={!!(q || projectFilter || (typeFilter && typeFilter !== "all"))} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount ?? 0}
            pageSize={PAGE_SIZE}
            buildHref={buildHref}
          />
        </div>

        {/* Sidebar: uploader */}
        <div>
          <ImageUploader projects={normalizedProjects} userId={user.id} />

          <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Formatos admitidos:</span> JPG, PNG, WEBP y GIF.
              Tamaño máximo: 10 MB por imagen. Las imágenes se almacenan de forma segura y son accesibles solo para ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
