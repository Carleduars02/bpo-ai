"use client"

import { useOptimistic, useTransition } from "react"
import type { AuditRecommendation } from "@/lib/ai/audit"
import { toggleRecommendationAction } from "../actions/audit.actions"
import { Target, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const HOVER_CARD = "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"

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

interface RecommendationChecklistProps {
  auditId: string
  recommendations: AuditRecommendation[]
}

export function RecommendationChecklist({ auditId, recommendations }: RecommendationChecklistProps) {
  const [, startTransition] = useTransition()
  const [optimisticRecs, setOptimisticDone] = useOptimistic(
    recommendations,
    (state, { index, done }: { index: number; done: boolean }) =>
      state.map((rec, i) => (i === index ? { ...rec, done } : rec))
  )

  const doneCount = optimisticRecs.filter((r) => r.done).length
  const total = optimisticRecs.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  function handleToggle(index: number, done: boolean) {
    startTransition(async () => {
      setOptimisticDone({ index, done })
      await toggleRecommendationAction(auditId, index, done)
    })
  }

  if (total === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </span>
        <span className="text-base font-bold tracking-tight">Plan de acción recomendado</span>
        <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">
          {doneCount}/{total} implementadas
        </span>
      </h3>

      {/* Barra de progreso de implementación */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-500" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 space-y-3">
        {optimisticRecs.map((rec, i) => {
          const priorityColor =
            rec.priority === "high"   ? "bg-red-500/10 text-red-400 border-red-500/20" :
            rec.priority === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
          const isDone = !!rec.done
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleToggle(i, !isDone)}
              aria-pressed={isDone}
              className={cn(
                "flex w-full gap-3 rounded-lg border p-3 text-left",
                HOVER_CARD,
                isDone ? "border-green-500/30 bg-green-500/5" : "border-border/50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isDone ? "bg-green-500/20 text-green-400" : "bg-primary/10 text-primary"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="flex-1 space-y-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn("text-sm font-medium", isDone && "text-muted-foreground line-through")}>
                    {rec.title}
                  </span>
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${priorityColor}`}>
                    {PRIORITY_LABELS[rec.priority]}
                  </span>
                  <span className="inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {AREA_LABELS[rec.area] ?? rec.area}
                  </span>
                </span>
                <span className={cn("block text-xs text-muted-foreground", isDone && "line-through")}>
                  {rec.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
