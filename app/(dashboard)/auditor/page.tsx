import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus, Sparkles, ScanSearch } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { Pagination } from "@/components/shared/Pagination"
import { AuditsList } from "@/features/audits/components/AuditsList"

export const metadata: Metadata = { title: "Auditor IA | BPO AI" }

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ view?: string; page?: string }>
}

export default async function AuditorPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { view: viewParam, page: pageParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: audits, count: totalCount } = await supabase
    .from("audits")
    .select("id, total_score, created_at, business_name_input, projects(name), clients(business_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))

  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (viewParam) params.set("view", viewParam)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/auditor?${qs}` : "/auditor"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        icon={ScanSearch}
        title="Auditor IA"
        subtitle={`${totalCount ?? 0} auditoría${(totalCount ?? 0) !== 1 ? "s" : ""} generada${(totalCount ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link href="/auditor/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva auditoría
          </Link>
        }
      />

      {!audits || audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Sparkles className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin auditorías todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Analiza tu primer perfil de WhatsApp Business con inteligencia artificial.
          </p>
          <Link href="/auditor/new" className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva auditoría
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <ViewToggle current={view} />
          </div>
          <AuditsList audits={audits} view={view} />
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
