import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Pagination } from "@/components/shared/Pagination"
import { CatalogList } from "@/features/catalogs/components/CatalogList"

export const metadata: Metadata = { title: "Catálogos | BPO AI" }

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ view?: string; page?: string }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { view: viewParam, page: pageParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: catalogs, count: totalCount } = await supabase
    .from("catalogs")
    .select("id, name, created_at, projects(name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (viewParam) params.set("view", viewParam)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/catalog?${qs}` : "/catalog"
  }

  const catalogIds = (catalogs ?? []).map((c) => c.id)
  const { data: counts } = catalogIds.length
    ? await supabase
        .from("catalog_items")
        .select("catalog_id")
        .in("catalog_id", catalogIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.catalog_id] = (countMap[row.catalog_id] ?? 0) + 1
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        icon={Package}
        title="Catálogos"
        subtitle={`${totalCount ?? 0} catálogo${(totalCount ?? 0) !== 1 ? "s" : ""} creado${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href="/catalog/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo catálogo
          </Link>
        }
      />

      {!catalogs || catalogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin catálogos todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Crea el catálogo de productos o servicios de un cliente para WhatsApp Business.
          </p>
          <Link href="/catalog/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <ViewToggle current={view} />
          </div>
          <CatalogList catalogs={catalogs} itemCounts={countMap} view={view} />
        </>
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
