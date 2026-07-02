const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-zinc-500/15 text-zinc-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  review:      "bg-yellow-500/15 text-yellow-400",
  completed:   "bg-green-500/15 text-green-400",
  archived:    "bg-zinc-500/10 text-zinc-500",
}

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pendiente",
  in_progress: "En progreso",
  review:      "En revisión",
  completed:   "Completado",
  archived:    "Archivado",
}

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-zinc-500/15 text-zinc-400"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
