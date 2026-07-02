"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { List, LayoutGrid, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"

const VIEWS = [
  { value: "list",  label: "Lista",    Icon: List },
  { value: "grid",  label: "Tarjetas", Icon: LayoutGrid },
  { value: "table", label: "Tabla",    Icon: Table2 },
] as const

export type ViewMode = typeof VIEWS[number]["value"]

export function ViewToggle({ current }: { current: ViewMode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function hrefFor(view: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (view === "list") params.delete("view")
    else params.set("view", view)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
      {VIEWS.map(({ value, label, Icon }) => (
        <Link
          key={value}
          href={hrefFor(value)}
          title={label}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            current === value
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </Link>
      ))}
    </div>
  )
}
