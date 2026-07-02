import Link from "next/link"
import { Calendar } from "lucide-react"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { getOne } from "@/lib/supabase/utils"

export interface AuditRow {
  id:                 string
  total_score:        number
  created_at:         string
  business_name_input: string | null
  projects: { name: string } | { name: string }[] | null
  clients:  { business_name: string } | { business_name: string }[] | null
}

interface AuditsListProps {
  audits: AuditRow[]
  view: ViewMode
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/10 border-green-500/20"
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20"
  return "bg-red-500/10 border-red-500/20"
}

export function AuditsList({ audits, view }: AuditsListProps) {
  if (view === "grid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {audits.map((audit) => {
          const project = getOne(audit.projects)
          const client = getOne(audit.clients)
          return (
            <Link
              key={audit.id}
              href={`/auditor/${audit.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/20"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-base font-bold ${scoreBg(audit.total_score)} ${scoreColor(audit.total_score)}`}>
                  {audit.total_score}
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(audit.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {audit.business_name_input || client?.business_name || "Sin nombre"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{project?.name}</p>
              </div>
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
          <div className="grid grid-cols-[auto_2fr_1.5fr_1fr] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Score</span>
            <span>Nombre</span>
            <span>Proyecto</span>
            <span>Fecha</span>
          </div>
          <div className="divide-y divide-border">
            {audits.map((audit) => {
              const project = getOne(audit.projects)
              const client = getOne(audit.clients)
              return (
                <Link
                  key={audit.id}
                  href={`/auditor/${audit.id}`}
                  className="grid grid-cols-[auto_2fr_1.5fr_1fr] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/30"
                >
                  <span className={`font-bold ${scoreColor(audit.total_score)}`}>{audit.total_score}</span>
                  <span className="truncate font-medium">
                    {audit.business_name_input || client?.business_name || "Sin nombre"}
                  </span>
                  <span className="truncate text-muted-foreground">{project?.name ?? "—"}</span>
                  <span className="truncate text-muted-foreground">
                    {new Date(audit.created_at).toLocaleDateString("es-ES")}
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
      {audits.map((audit) => {
        const project = getOne(audit.projects)
        const client = getOne(audit.clients)
        return (
          <Link
            key={audit.id}
            href={`/auditor/${audit.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40 hover:bg-card/80"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-lg font-bold ${scoreBg(audit.total_score)} ${scoreColor(audit.total_score)}`}>
                {audit.total_score}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {audit.business_name_input || client?.business_name || "Sin nombre"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(audit.created_at).toLocaleDateString("es-ES")}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
