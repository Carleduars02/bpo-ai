"use client"

import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkActionBarProps {
  count: number
  onClear: () => void
  isPending: boolean
  children: React.ReactNode
}

export function BulkActionBar({ count, onClear, isPending, children }: BulkActionBarProps) {
  if (count === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-popover px-3 py-2 shadow-2xl ring-1 ring-foreground/10">
        <button
          type="button"
          onClick={onClear}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          {count} seleccionado{count !== 1 ? "s" : ""}
        </button>
        <div className="h-4 w-px bg-border" />
        {children}
        {isPending && <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground")} />}
      </div>
    </div>
  )
}
