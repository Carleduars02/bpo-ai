import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  buildHref: (page: number) => string
}

export function Pagination({ currentPage, totalPages, totalCount, pageSize, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        {start}–{end} de {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            currentPage <= 1 && "pointer-events-none opacity-40"
          )}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Anterior
        </Link>
        <span className="text-xs text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
        <Link
          href={buildHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            currentPage >= totalPages && "pointer-events-none opacity-40"
          )}
        >
          Siguiente
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
