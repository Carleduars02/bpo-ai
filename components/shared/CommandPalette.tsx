"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Search, Users, FolderOpen, ScanSearch, Package, MessageSquare, Wand2, Loader2, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { globalSearchAction, type SearchResult, type SearchResultType } from "@/features/search/actions/search.actions"

const TYPE_CONFIG: Record<SearchResultType, { label: string; icon: typeof Users; colorClass: string }> = {
  client:  { label: "Clientes",   icon: Users,         colorClass: "bg-primary/10 text-primary" },
  project: { label: "Proyectos",  icon: FolderOpen,    colorClass: "bg-green-500/10 text-green-400" },
  audit:   { label: "Auditorías", icon: ScanSearch,    colorClass: "bg-accent/15 text-accent" },
  catalog: { label: "Catálogos",  icon: Package,       colorClass: "bg-warning/15 text-warning" },
  message: { label: "Mensajes",   icon: MessageSquare, colorClass: "bg-primary/10 text-primary" },
  content: { label: "Contenido",  icon: Wand2,         colorClass: "bg-accent/15 text-accent" },
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState("")
  const [results, setResults]     = useState<SearchResult[]>([])
  const [loading, setLoading]     = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  }, [open])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (next) {
      setQuery("")
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        handleOpenChange(!openRef.current)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleOpenChange])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      return
    }
    debounceRef.current = setTimeout(async () => {
      const r = await globalSearchAction(query)
      setResults(r)
      setActiveIndex(0)
      setLoading(false)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const navigateTo = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  function handleQueryChange(value: string) {
    setQuery(value)
    setLoading(value.trim().length >= 2)
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const target = results[activeIndex]
      if (target) navigateTo(target.href)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      {/* Escritorio: botón con texto y atajo de teclado */}
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar…
            <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
          </button>
        }
      />

      {/* Móvil: no hay atajo de teclado físico, se necesita un botón visible */}
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label="Buscar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground sm:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-[15%] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl transition duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Buscar clientes, proyectos, auditorías, catálogos, mensajes, contenido…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">Esc</kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                Escribe al menos 2 caracteres para buscar en toda la plataforma.
              </p>
            ) : results.length === 0 && !loading ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                Sin resultados para &quot;{query}&quot;.
              </p>
            ) : (
              (Object.keys(TYPE_CONFIG) as SearchResultType[]).map((type) => {
                const items = results.filter((r) => r.type === type)
                if (items.length === 0) return null
                const { label, icon: Icon, colorClass } = TYPE_CONFIG[type]
                return (
                  <div key={type} className="mb-2 last:mb-0">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {label}
                    </p>
                    {items.map((item) => {
                      const globalIndex = results.indexOf(item)
                      const isActive = globalIndex === activeIndex
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          onClick={() => navigateTo(item.href)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                            isActive ? "bg-accent/60" : "hover:bg-accent/30"
                          )}
                        >
                          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{item.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                          </span>
                          {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
