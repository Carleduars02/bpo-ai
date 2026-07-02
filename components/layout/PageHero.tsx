import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface PageHeroProps {
  icon: LucideIcon
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHero({ icon: Icon, eyebrow, title, subtitle, actions, className }: PageHeroProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-7", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-accent/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            {eyebrow && (
              <p className="text-sm text-muted-foreground">{eyebrow}</p>
            )}
            <h1 className={cn("text-2xl font-bold tracking-tight sm:text-3xl", eyebrow && "mt-0.5")}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
