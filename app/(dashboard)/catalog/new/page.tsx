import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { createCatalogAction } from "@/features/catalogs/actions/catalog.actions"
import { ProjectContextCard } from "@/components/shared/ProjectContextCard"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nuevo catálogo | BPO AI" }

interface PageProps {
  searchParams: Promise<{ project_id?: string }>
}

export default async function NewCatalogPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project_id } = await searchParams

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name, sector, city, description, website)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!projects || projects.length === 0) {
    redirect("/projects/new")
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/catalog" className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          Catálogos
        </Link>
        <h1 className="text-2xl font-bold">Nuevo catálogo</h1>
        <p className="text-sm text-muted-foreground">
          Crea un catálogo de productos o servicios para un proyecto.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form
          action={async (formData: FormData) => {
            "use server"
            const result = await createCatalogAction({
              project_id: String(formData.get("project_id") ?? ""),
              name:       String(formData.get("name") ?? ""),
            })
            if ("catalogId" in result) {
              redirect(`/catalog/${result.catalogId}?created=1`)
            }
          }}
          className="space-y-5"
        >
          <div className="space-y-3">
            <label htmlFor="project_id" className="text-sm font-medium">
              Proyecto *
            </label>
            <select
              id="project_id"
              name="project_id"
              defaultValue={project_id ?? ""}
              required
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:border-ring focus:outline-none"
            >
              <option value="" disabled>Selecciona un proyecto…</option>
              {projects.map((p) => {
                const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}{client ? ` — ${(client as { business_name: string }).business_name}` : ""}
                  </option>
                )
              })}
            </select>
            {(() => {
              const preSelected = projects.find((p) => p.id === project_id)
              const client = preSelected
                ? Array.isArray(preSelected.clients) ? preSelected.clients[0] ?? null : preSelected.clients
                : null
              return client ? (
                <ProjectContextCard client={client as Parameters<typeof ProjectContextCard>[0]["client"]} />
              ) : null
            })()}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del catálogo *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue="Catálogo Principal"
              placeholder="Ej: Catálogo Principal, Menú, Servicios…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Link href="/catalog" className={buttonVariants({ variant: "ghost" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
            <button
              type="submit"
              className={buttonVariants()}
            >
              Crear catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
