"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Trash2 } from "lucide-react"
import { SERVICE_TYPES, PROJECT_STATUSES } from "@/constants/navigation"
import { ProjectStatusBadge } from "./ProjectStatusBadge"
import { BulkActionBar } from "@/components/shared/BulkActionBar"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { bulkUpdateProjectStatusAction, bulkDeleteProjectsAction } from "../actions/project.actions"

type ProjectStatus = "pending" | "in_progress" | "review" | "completed" | "archived"

export interface ProjectRow {
  id:             string
  name:           string
  status:         string
  service_type:   string | null
  delivery_date:  string | null
  clients:        { business_name: string } | { business_name: string }[] | null
}

interface ProjectsListProps {
  projects: ProjectRow[]
  view:     ViewMode
}

function getClient(project: ProjectRow) {
  return Array.isArray(project.clients) ? project.clients[0] : project.clients
}

export function ProjectsList({ projects, view }: ProjectsListProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === projects.length ? new Set() : new Set(projects.map((p) => p.id))))
  }

  function clear() {
    setSelected(new Set())
  }

  function runBulkStatus(status: ProjectStatus) {
    const ids = Array.from(selected)
    startTransition(async () => {
      await bulkUpdateProjectStatusAction(ids, status)
      clear()
      router.refresh()
    })
  }

  function runBulkDelete() {
    const ids = Array.from(selected)
    startTransition(async () => {
      await bulkDeleteProjectsAction(ids)
      clear()
      router.refresh()
    })
  }

  const isAllSelected = projects.length > 0 && selected.size === projects.length

  return (
    <>
      {projects.length > 0 && (
        <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            className="h-3.5 w-3.5 rounded border-border accent-primary"
          />
          Seleccionar todos en esta página
        </label>
      )}

      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const client = getClient(project)
            const serviceLabel = SERVICE_TYPES.find((s) => s.value === project.service_type)?.label
            return (
              <div
                key={project.id}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/20",
                  selected.has(project.id) ? "border-primary/50 bg-primary/5" : "border-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(project.id)}
                  onChange={() => toggle(project.id)}
                  className="absolute right-3 top-3 z-10 h-4 w-4 rounded border-border accent-primary"
                />
                <Link href={`/projects/${project.id}`} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 pr-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {client?.business_name}
                      {serviceLabel && <> · {serviceLabel}</>}
                    </p>
                  </div>
                  {project.delivery_date && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(project.delivery_date).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span />
              <span>Proyecto</span>
              <span>Cliente</span>
              <span>Servicio</span>
              <span>Entrega</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-border">
              {projects.map((project) => {
                const client = getClient(project)
                const serviceLabel = SERVICE_TYPES.find((s) => s.value === project.service_type)?.label
                return (
                  <div
                    key={project.id}
                    className={cn(
                      "grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/30",
                      selected.has(project.id) && "bg-primary/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(project.id)}
                      onChange={() => toggle(project.id)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    <Link href={`/projects/${project.id}`} className="truncate font-medium hover:text-primary">
                      {project.name}
                    </Link>
                    <span className="truncate text-muted-foreground">{client?.business_name ?? "—"}</span>
                    <span className="truncate text-muted-foreground">{serviceLabel ?? "—"}</span>
                    <span className="truncate text-muted-foreground">
                      {project.delivery_date ? new Date(project.delivery_date).toLocaleDateString("es-ES") : "—"}
                    </span>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            const client = getClient(project)
            const serviceLabel = SERVICE_TYPES.find((s) => s.value === project.service_type)?.label
            return (
              <div
                key={project.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-ring/40 hover:bg-card/80",
                  selected.has(project.id) ? "border-primary/50 bg-primary/5" : "border-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(project.id)}
                  onChange={() => toggle(project.id)}
                  className="h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
                />
                <Link href={`/projects/${project.id}`} className="flex flex-1 items-center justify-between min-w-0">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {client?.business_name}
                        {serviceLabel && <> · {serviceLabel}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {project.delivery_date && (
                      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.delivery_date).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    <ProjectStatusBadge status={project.status} />
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <BulkActionBar count={selected.size} onClear={clear} isPending={isPending}>
        {PROJECT_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => runBulkStatus(s.value as ProjectStatus)}
            disabled={isPending}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {s.label}
          </button>
        ))}
        <div className="h-4 w-px bg-border" />
        <button
          type="button"
          onClick={runBulkDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </BulkActionBar>
    </>
  )
}
