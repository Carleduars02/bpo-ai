import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  active: {
    label: "Activo",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  potential: {
    label: "Potencial",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  archived: {
    label: "Archivado",
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  },
} as const

interface ClientStatusBadgeProps {
  status: string
  className?: string
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
