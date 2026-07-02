import Link from "next/link"
import { Package, Calendar } from "lucide-react"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { getOne } from "@/lib/supabase/utils"

export interface CatalogRow {
  id:         string
  name:       string
  created_at: string
  projects:   { name: string } | { name: string }[] | null
  clients:    { business_name: string } | { business_name: string }[] | null
}

interface CatalogListProps {
  catalogs: CatalogRow[]
  itemCounts: Record<string, number>
  view: ViewMode
}

export function CatalogList({ catalogs, itemCounts, view }: CatalogListProps) {
  if (view === "grid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((catalog) => {
          const project = getOne(catalog.projects)
          const client = getOne(catalog.clients)
          const itemCount = itemCounts[catalog.id] ?? 0
          return (
            <Link
              key={catalog.id}
              href={`/catalog/${catalog.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground">{itemCount} producto{itemCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{catalog.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {client?.business_name}
                  {project?.name && <> · {project.name}</>}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                {new Date(catalog.created_at).toLocaleDateString("es-ES")}
              </span>
            </Link>
          )
        })}
      </div>
    )
  }

  if (view === "table") {
    return (
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Catálogo</span>
            <span>Cliente</span>
            <span>Productos</span>
            <span>Creado</span>
          </div>
          <div className="divide-y divide-border">
            {catalogs.map((catalog) => {
              const project = getOne(catalog.projects)
              const client = getOne(catalog.clients)
              const itemCount = itemCounts[catalog.id] ?? 0
              return (
                <Link
                  key={catalog.id}
                  href={`/catalog/${catalog.id}`}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/30"
                >
                  <span className="truncate font-medium">{catalog.name}</span>
                  <span className="truncate text-muted-foreground">
                    {client?.business_name ?? "—"}
                    {project?.name && <> · {project.name}</>}
                  </span>
                  <span className="truncate text-muted-foreground">{itemCount}</span>
                  <span className="truncate text-muted-foreground">
                    {new Date(catalog.created_at).toLocaleDateString("es-ES")}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {catalogs.map((catalog) => {
        const project = getOne(catalog.projects)
        const client = getOne(catalog.clients)
        const itemCount = itemCounts[catalog.id] ?? 0
        return (
          <Link
            key={catalog.id}
            href={`/catalog/${catalog.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40 hover:bg-card/80"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{catalog.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {client?.business_name}
                  {project?.name && <> · {project.name}</>}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
              <span>{itemCount} producto{itemCount !== 1 ? "s" : ""}</span>
              <span className="hidden items-center gap-1 sm:flex">
                <Calendar className="h-3 w-3" />
                {new Date(catalog.created_at).toLocaleDateString("es-ES")}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
