import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { deleteCatalogAction, deleteCatalogItemAction } from "@/features/catalogs/actions/catalog.actions"
import { ArrowLeft, Plus, Package, Sparkles, Tag, FileSpreadsheet, FileText } from "lucide-react"
import { ExportCSVButton } from "@/features/catalogs/components/ExportCSVButton"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; item_added?: string; item_updated?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from("catalogs").select("name").eq("id", id).single()
  return { title: data ? `${data.name} | BPO AI` : "Catálogo | BPO AI" }
}

export default async function CatalogDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const { created, item_added, item_updated } = await searchParams

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*, projects(id, name), clients(id, business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!catalog) notFound()

  const { data: items } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("catalog_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  const project = Array.isArray(catalog.projects) ? catalog.projects[0] : catalog.projects
  const client  = Array.isArray(catalog.clients)  ? catalog.clients[0]  : catalog.clients

  const banner =
    created      === "1" ? "✓ Catálogo creado correctamente." :
    item_added   === "1" ? "✓ Producto agregado correctamente." :
    item_updated === "1" ? "✓ Producto actualizado correctamente." :
    null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {banner && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {banner}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={project ? `/projects/${(project as { id: string }).id}` : "/catalog"}
            className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {(project as { name: string } | null)?.name ?? "Catálogos"}
          </Link>
          <h1 className="text-2xl font-bold">{catalog.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(client as { business_name: string } | null)?.business_name}
            {" · "}
            {items?.length ?? 0} producto{(items?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/catalog/${id}/import`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileSpreadsheet className="mr-2 h-3.5 w-3.5" />
            Importar en masa
          </Link>
          {(items?.length ?? 0) > 0 && (
            <>
              <ExportCSVButton catalogId={id} />
              <Link
                href={`/catalog/${id}/preview`}
                target="_blank"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Vista previa PDF
              </Link>
            </>
          )}
          <Link
            href={`/catalog/${id}/items/new`}
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Agregar producto
          </Link>
        </div>
      </div>

      {/* Items */}
      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <Package className="mb-4 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Catálogo vacío</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Agrega el primer producto o servicio.
          </p>
          <Link href={`/catalog/${id}/items/new`} className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar producto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const benefits = Array.isArray(item.benefits) ? item.benefits as string[] : []
            const keywords = Array.isArray(item.keywords) ? item.keywords as string[] : []
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.is_ai_generated && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Sparkles className="h-2.5 w-2.5" />
                          IA
                        </span>
                      )}
                      {item.status === "draft" && (
                        <span className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                          Borrador
                        </span>
                      )}
                      {item.price != null && item.price > 0 && (
                        <span className="text-sm font-medium text-primary">
                          {item.currency} {Number(item.price).toLocaleString("es-ES")}
                        </span>
                      )}
                    </div>
                    {item.category && (
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/catalog/${id}/items/${item.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        "use server"
                        await deleteCatalogItemAction(item.id, id)
                        redirect(`/catalog/${id}`)
                      }}
                    >
                      <button
                        type="submit"
                        className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-red-400 hover:text-red-300 hover:bg-red-500/10"}
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-foreground/80">{item.description}</p>
                )}

                {benefits.length > 0 && (
                  <ul className="space-y-0.5">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 text-primary">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {(item.cta || keywords.length > 0) && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2">
                    {item.cta && (
                      <span className="text-xs font-medium text-primary">{item.cta}</span>
                    )}
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {keywords.map((k, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Zona de peligro */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <form
          action={async () => {
            "use server"
            const result = await deleteCatalogAction(id)
            if (!("error" in result)) {
              redirect("/catalog")
            }
          }}
        >
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " border-red-500/30 text-red-400 hover:bg-red-500/10"}
          >
            Eliminar catálogo
          </button>
        </form>
      </div>
    </div>
  )
}
