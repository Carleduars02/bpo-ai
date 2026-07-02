import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft, Star, FileText } from "lucide-react"
import { DeleteFavoriteButton } from "@/features/messages/components/DeleteFavoriteButton"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Mensajes guardados | BPO AI" }

const CATEGORY_LABELS: Record<string, string> = {
  welcome:     "Bienvenida",
  away:        "Ausencia",
  quick_reply: "Respuesta rápida",
  status:      "Estado",
}

export default async function MessageFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: favorites } = await supabase
    .from("message_favorites")
    .select("id, category, label, text, created_at, project_id, projects(name), clients(business_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const groups = new Map<string, {
    projectId: string
    projectName: string
    businessName: string
    items: typeof favorites
  }>()

  for (const f of favorites ?? []) {
    const project = Array.isArray(f.projects) ? f.projects[0] : f.projects
    const client  = Array.isArray(f.clients)  ? f.clients[0]  : f.clients
    const key = f.project_id
    if (!groups.has(key)) {
      groups.set(key, {
        projectId:    f.project_id,
        projectName:  (project as { name: string } | null)?.name ?? "",
        businessName: (client as { business_name: string } | null)?.business_name ?? "—",
        items: [],
      })
    }
    groups.get(key)!.items!.push(f)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/messages"
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Mensajes
        </Link>
        <h1 className="text-2xl font-bold">Mensajes guardados</h1>
        <p className="text-sm text-muted-foreground">
          Los mensajes que marcaste con ★ se guardan aquí permanentemente, aunque generes nuevos sets con IA.
        </p>
      </div>

      {groups.size === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Star className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin mensajes guardados todavía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Abre un set de mensajes generado y presiona &quot;Guardar&quot; en los que funcionen mejor.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.values()).map((group) => (
            <div key={group.projectId} className="space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <div>
                  <h2 className="text-sm font-semibold">{group.businessName}</h2>
                  <p className="text-xs text-muted-foreground">{group.projectName} · {group.items!.length} guardado{group.items!.length !== 1 ? "s" : ""}</p>
                </div>
                <Link
                  href={`/messages/favorites/${group.projectId}/preview`}
                  target="_blank"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Vista previa PDF
                </Link>
              </div>

              <div className="space-y-2">
                {group.items!.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                        {item.label && (
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{item.text}</p>
                    </div>
                    <DeleteFavoriteButton id={item.id} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
