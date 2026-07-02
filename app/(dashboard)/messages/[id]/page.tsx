import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { MessageSetResult } from "@/features/messages/components/MessageSetResult"
import { deleteMessageSetAction } from "@/features/messages/actions/message.actions"
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react"
import type { Metadata } from "next"
import type { WelcomeMessage, QuickReply, StatusText } from "@/lib/ai/messages"
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle"
import { PageHero } from "@/components/layout/PageHero"

const TONE_LABELS: Record<string, string> = {
  profesional:  "Profesional",
  cercano:      "Cercano y amigable",
  formal:       "Formal y corporativo",
  aspiracional: "Aspiracional y premium",
  divertido:    "Divertido y creativo",
}

interface PageProps {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ created?: string; view?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id }   = await params
  const { data } = await supabase
    .from("generated_content")
    .select("clients(business_name)")
    .eq("id", id)
    .single()
  const client = data ? (Array.isArray(data.clients) ? data.clients[0] : data.clients) : null
  const name   = (client as { business_name: string } | null)?.business_name
  return { title: name ? `Mensajes — ${name} | BPO AI` : "Mensajes | BPO AI" }
}

export default async function MessageSetDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id }      = await params
  const { created, view: viewParam } = await searchParams
  const view: ViewMode = viewParam === "grid" || viewParam === "table" ? viewParam : "list"

  const { data: set } = await supabase
    .from("generated_content")
    .select("*, projects(id, name), clients(id, business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("content_type", "message_set")
    .single()

  if (!set) notFound()

  let parsed: {
    input?: { business_name?: string; sector?: string; tone?: string; schedule?: string; services?: string }
    output?: {
      welcome_messages?: WelcomeMessage[]
      away_message?:     string
      quick_replies?:    QuickReply[]
      status_texts?:     StatusText[]
    }
  } = {}

  try {
    parsed = JSON.parse(set.raw_output ?? "{}")
  } catch {
    // raw_output corrupto
  }

  const output          = parsed.output ?? {}
  const welcome_messages: WelcomeMessage[] = output.welcome_messages ?? []
  const away_message:     string           = output.away_message ?? ""
  const quick_replies:    QuickReply[]     = output.quick_replies ?? []
  const status_texts:     StatusText[]     = output.status_texts ?? []

  const project = Array.isArray(set.projects) ? set.projects[0] : set.projects
  const client  = Array.isArray(set.clients)  ? set.clients[0]  : set.clients
  const pinnedItems: string[] = Array.isArray(set.pinned_items) ? set.pinned_items : []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {created === "1" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Mensajes generados correctamente con IA.
        </div>
      )}

      {/* Cabecera */}
      <PageHero
        icon={MessageSquare}
        eyebrow={
          <Link
            href={project ? `/projects/${(project as { id: string }).id}` : "/messages"}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {(project as { name: string } | null)?.name ?? "Mensajes"}
          </Link>
        }
        title={(client as { business_name: string } | null)?.business_name ?? "Set de mensajes"}
        subtitle={
          <span className="flex flex-wrap items-center gap-3">
            {set.tone && (
              <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                {TONE_LABELS[set.tone] ?? set.tone}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(set.created_at).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </span>
        }
        actions={
          <Link
            href="/messages/new"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Generar nuevo
          </Link>
        }
      />

      {/* Datos usados para la generación */}
      {parsed.input && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Datos utilizados
          </h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {parsed.input.sector   && <DataRow label="Sector"   value={parsed.input.sector} />}
            {parsed.input.schedule && <DataRow label="Horario"  value={parsed.input.schedule} />}
            {parsed.input.services && <DataRow label="Servicios" value={parsed.input.services} />}
          </div>
        </div>
      )}

      {/* Resultado */}
      <div className="flex justify-end">
        <ViewToggle current={view} />
      </div>
      <MessageSetResult
        contentId={id}
        projectId={(project as { id: string } | null)?.id ?? ""}
        view={view}
        pinnedItems={pinnedItems}
        welcome_messages={welcome_messages}
        away_message={away_message}
        quick_replies={quick_replies}
        status_texts={status_texts}
      />

      {/* Zona de peligro */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <form
          action={async () => {
            "use server"
            const result = await deleteMessageSetAction(id)
            if (!("error" in result)) redirect("/messages")
          }}
        >
          <button
            type="submit"
            className={
              buttonVariants({ variant: "outline", size: "sm" }) +
              " border-red-500/30 text-red-400 hover:bg-red-500/10"
            }
          >
            Eliminar este set
          </button>
        </form>
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="text-foreground/80">{value}</span>
    </div>
  )
}
