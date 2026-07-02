import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { CLIENT_STATUS_LABELS } from "@/constants/navigation"
import { Users, Plus, Search } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Pagination } from "@/components/shared/Pagination"
import { ClientsList } from "@/features/clients/components/ClientsList"

export const metadata: Metadata = {
  title: "Clientes | BPO AI",
}

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; created?: string; view?: string; page?: string }>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { q, status, created, view: viewParam, page: pageParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(
      `business_name.ilike.%${q}%,owner_name.ilike.%${q}%,city.ilike.%${q}%,whatsapp_phone.ilike.%${q}%`
    )
  }

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data: clients, count: totalCount } = await query

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status) params.set("status", status)
    if (viewParam) params.set("view", viewParam)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/clients?${qs}` : "/clients"
  }

  return (
    <div className="space-y-6">
      <PageHero
        icon={Users}
        title="Clientes"
        subtitle={`${totalCount ?? 0} cliente${(totalCount ?? 0) !== 1 ? "s" : ""} registrado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href="/clients/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Link>
        }
      />

      {/* Banner de éxito */}
      {created === "1" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Cliente creado correctamente.
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre, ciudad, teléfono…"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex gap-2">
          {(["all", "active", "potential", "archived"] as const).map((s) => (
            <Link
              key={s}
              href={`/clients?${q ? `q=${q}&` : ""}status=${s}`}
              className={buttonVariants({
                variant: s === (status ?? "all") ? "secondary" : "ghost",
                size: "sm",
              })}
            >
              {s === "all" ? "Todos" : CLIENT_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        <ViewToggle current={view} />
      </div>

      {/* Registros */}
      {!clients || clients.length === 0 ? (
        <EmptyState hasFilters={!!(q || status)} />
      ) : (
        <ClientsList clients={clients} view={view} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount ?? 0}
        pageSize={PAGE_SIZE}
        buildHref={buildHref}
      />
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Users className="h-7 w-7 text-primary" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-base font-semibold">Sin resultados</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay clientes que coincidan con tu búsqueda.
          </p>
          <Link href="/clients" className={buttonVariants({ variant: "ghost", size: "sm" }) + " mt-4"}>
            Limpiar filtros
          </Link>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold">Aún no tienes clientes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra tu primer cliente para empezar a trabajar.
          </p>
          <Link href="/clients/new" className={buttonVariants({ size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Crear primer cliente
          </Link>
        </>
      )}
    </div>
  )
}
