import type { AuditIssue, AuditPositive, AuditRecommendation } from "@/lib/ai/audit"
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Lightbulb, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { RecommendationChecklist } from "./RecommendationChecklist"

const HOVER_CARD = "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"

interface AuditResultProps {
  // Con auditId las recomendaciones son un checklist persistente; sin él, solo lectura
  auditId?: string
  total_score: number
  scores_breakdown: {
    identity: number
    information: number
    catalog: number
    communication: number
  }
  ai_diagnosis: string
  critical_issues: AuditIssue[]
  moderate_issues: AuditIssue[]
  minor_issues: AuditIssue[]
  positive_aspects: AuditPositive[]
  recommendations: AuditRecommendation[]
}

const AREA_LABELS: Record<string, string> = {
  identity:      "Identidad",
  information:   "Información",
  catalog:       "Catálogo",
  communication: "Comunicación",
}

const PRIORITY_LABELS: Record<string, string> = {
  high:   "Alta",
  medium: "Media",
  low:    "Baja",
}

function scoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return "text-green-400"
  if (pct >= 0.6) return "text-yellow-400"
  return "text-red-400"
}

function scoreBarColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return "bg-green-500"
  if (pct >= 0.6) return "bg-yellow-500"
  return "bg-red-500"
}

export function AuditResult({
  auditId,
  total_score,
  scores_breakdown,
  ai_diagnosis,
  critical_issues,
  moderate_issues,
  minor_issues,
  positive_aspects,
  recommendations,
}: AuditResultProps) {
  const totalColor =
    total_score >= 80 ? "text-green-400" :
    total_score >= 60 ? "text-yellow-400" :
    "text-red-400"

  const ringHex =
    total_score >= 80 ? "#4ade80" :
    total_score >= 60 ? "#facc15" :
    "#f87171"

  const scoreMessage =
    total_score >= 80 ? "¡Excelente perfil!" :
    total_score >= 60 ? "Buen camino, hay margen" :
    "Necesita atención"

  const dimensions = [
    { key: "identity",      label: "Identidad",      max: 25, score: scores_breakdown.identity },
    { key: "information",   label: "Información",     max: 25, score: scores_breakdown.information },
    { key: "catalog",       label: "Catálogo",        max: 25, score: scores_breakdown.catalog },
    { key: "communication", label: "Comunicación",    max: 25, score: scores_breakdown.communication },
  ]

  return (
    <div className="space-y-6">
      {/* Score principal + breakdown */}
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="relative col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6">
          <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${ringHex} ${total_score * 3.6}deg, var(--border) 0deg)`,
              boxShadow: `0 0 24px -6px ${ringHex}66`,
            }}
          >
            <div className="flex h-[86px] w-[86px] flex-col items-center justify-center rounded-full bg-card">
              <p className={cn("text-3xl font-bold tabular-nums", totalColor)}>{total_score}</p>
              <p className="text-[10px] font-medium text-muted-foreground">/ 100</p>
            </div>
          </div>
          <p className="text-center text-xs font-semibold">{scoreMessage}</p>
        </div>

        <div className="col-span-4 grid grid-cols-2 gap-3">
          {dimensions.map((d) => (
            <div key={d.key} className={cn("rounded-xl border border-border bg-card p-4", HOVER_CARD)}>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-xs font-medium text-muted-foreground">{d.label}</p>
                <p className={`text-lg font-bold ${scoreColor(d.score, d.max)}`}>
                  {d.score}<span className="text-xs font-normal text-muted-foreground">/{d.max}</span>
                </p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all ${scoreBarColor(d.score, d.max)}`}
                  style={{ width: `${(d.score / d.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnóstico IA */}
      {ai_diagnosis && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={<Lightbulb className="h-4 w-4" />} colorClass="bg-primary/10 text-primary" title="Diagnóstico de IA" />
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{ai_diagnosis}</p>
        </div>
      )}

      {/* Problemas críticos */}
      {critical_issues.length > 0 && (
        <IssueSection
          title="Problemas críticos"
          issues={critical_issues}
          icon={<AlertTriangle className="h-4 w-4" />}
          colorClass="bg-red-500/10 text-red-400"
          badgeClass="bg-red-500/10 text-red-400 border-red-500/20"
          borderClass="border-red-500/20"
        />
      )}

      {/* Problemas moderados */}
      {moderate_issues.length > 0 && (
        <IssueSection
          title="Problemas moderados"
          issues={moderate_issues}
          icon={<AlertCircle className="h-4 w-4" />}
          colorClass="bg-yellow-500/10 text-yellow-400"
          badgeClass="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          borderClass="border-yellow-500/20"
        />
      )}

      {/* Problemas menores */}
      {minor_issues.length > 0 && (
        <IssueSection
          title="Mejoras menores"
          issues={minor_issues}
          icon={<Info className="h-4 w-4" />}
          colorClass="bg-blue-500/10 text-blue-400"
          badgeClass="bg-blue-500/10 text-blue-400 border-blue-500/20"
          borderClass="border-blue-500/20"
        />
      )}

      {/* Aspectos positivos */}
      {positive_aspects.length > 0 && (
        <div className="rounded-xl border border-green-500/20 bg-card p-5">
          <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />} colorClass="bg-green-500/10 text-green-400" title="Puntos positivos" />
          <div className="mt-3 space-y-2">
            {positive_aspects.map((item, i) => (
              <div key={i} className={cn("flex gap-3 rounded-lg p-2", HOVER_CARD, "border border-transparent")}>
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-400" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones: checklist persistente si hay auditId, solo lectura si no */}
      {recommendations.length > 0 && auditId && (
        <RecommendationChecklist auditId={auditId} recommendations={recommendations} />
      )}
      {recommendations.length > 0 && !auditId && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={<Target className="h-4 w-4" />} colorClass="bg-primary/10 text-primary" title="Plan de acción recomendado" />
          <div className="mt-3 space-y-3">
            {recommendations.map((rec, i) => {
              const priorityColor =
                rec.priority === "high"   ? "bg-red-500/10 text-red-400 border-red-500/20" :
                rec.priority === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
              return (
                <div key={i} className={cn("flex gap-3 rounded-lg border border-border/50 p-3", HOVER_CARD)}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${priorityColor}`}>
                        {PRIORITY_LABELS[rec.priority]}
                      </span>
                      <span className="inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {AREA_LABELS[rec.area] ?? rec.area}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function IssueSection({
  title,
  issues,
  icon,
  colorClass,
  badgeClass,
  borderClass,
}: {
  title: string
  issues: AuditIssue[]
  icon: React.ReactNode
  colorClass: string
  badgeClass: string
  borderClass: string
}) {
  return (
    <div className={`rounded-xl border ${borderClass} bg-card p-5`}>
      <SectionTitle icon={icon} colorClass={colorClass} title={title} count={issues.length} />
      <div className="mt-3 space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className={cn("flex gap-3 rounded-lg border border-transparent p-2", HOVER_CARD)}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{issue.title}</p>
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                  {AREA_LABELS[issue.area] ?? issue.area}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{issue.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({
  icon,
  colorClass,
  title,
  count,
}: {
  icon: React.ReactNode
  colorClass: string
  title: string
  count?: number
}) {
  return (
    <h3 className="flex items-center gap-3">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        {icon}
      </span>
      <span className="text-base font-bold tracking-tight">{title}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs font-normal text-muted-foreground">{count}</span>
      )}
    </h3>
  )
}
