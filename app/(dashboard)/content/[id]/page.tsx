import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import { ProfileResult, StatusPostsResultView, AnnouncementResultView } from "@/features/content/components/ContentResult"
import { deleteContentAction } from "@/features/content/actions/content.actions"
import { CONTENT_FORMAT_OPTIONS, type ContentFormat } from "@/features/content/schemas/content.schema"
import type { ProfileContentResult, StatusPostsResult, AnnouncementResult } from "@/lib/ai/content"
import type { Metadata } from "next"

const TONE_LABELS: Record<string, string> = {
  profesional:  "Profesional",
  cercano:      "Cercano",
  formal:       "Formal",
  aspiracional: "Aspiracional",
  divertido:    "Divertido",
}

const FORMAT_LABELS: Record<ContentFormat, string> = Object.fromEntries(
  CONTENT_FORMAT_OPTIONS.map((o) => [o.value, o.label])
) as Record<ContentFormat, string>

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id }   = await params
  const { data } = await supabase
    .from("generated_content")
    .select("clients(business_name)")
    .eq("id", id)
    .single()
  const client = Array.isArray(data?.clients) ? data.clients[0] : data?.clients
  const name   = (client as { business_name?: string } | null)?.business_name
  return { title: name ? `Contenido — ${name} | BPO AI` : "Contenido | BPO AI" }
}

export default async function ContentDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: record } = await supabase
    .from("generated_content")
    .select("*, projects(id, name), clients(business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("content_type", "profile_content")
    .single()

  if (!record) notFound()

  const project = Array.isArray(record.projects) ? record.projects[0] : record.projects
  const client  = Array.isArray(record.clients)  ? record.clients[0]  : record.clients

  let parsed: { format?: ContentFormat; input: Record<string, string>; output: unknown } | null = null
  try {
    parsed = JSON.parse(record.raw_output)
  } catch {
    notFound()
  }

  if (!parsed) notFound()

  // Registros creados antes del upgrade multi-formato no tienen `format` — se asumen de tipo Perfil
  const format = parsed.format ?? "profile"

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={project ? `/projects/${(project as { id: string }).id}` : "/content"}
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {(project as { name: string } | null)?.name ?? "Contenido"}
        </Link>
        <h1 className="text-2xl font-bold">
          {FORMAT_LABELS[format] ?? "Contenido"}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{(client as { business_name: string } | null)?.business_name}</span>
          {record.tone && (
            <span className="rounded-sm border border-border bg-card px-1.5 py-0.5 text-xs">
              {TONE_LABELS[record.tone] ?? record.tone}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {new Date(record.created_at).toLocaleDateString("es-ES", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Input summary */}
      {(parsed.input.target_audience || parsed.input.unique_value || parsed.input.additional_context || parsed.input.promo_offer || parsed.input.seasonal_occasion) && (
        <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Parámetros usados</p>
          {parsed.input.promo_offer && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">Oferta:</span>
              <span>{parsed.input.promo_offer}</span>
            </div>
          )}
          {parsed.input.seasonal_occasion && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">Ocasión:</span>
              <span>{parsed.input.seasonal_occasion}</span>
            </div>
          )}
          {parsed.input.target_audience && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">Público:</span>
              <span>{parsed.input.target_audience}</span>
            </div>
          )}
          {parsed.input.unique_value && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">Valor único:</span>
              <span>{parsed.input.unique_value}</span>
            </div>
          )}
          {parsed.input.additional_context && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">Contexto:</span>
              <span>{parsed.input.additional_context}</span>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {format === "status" ? (
        <StatusPostsResultView result={parsed.output as StatusPostsResult} />
      ) : format === "promo" || format === "seasonal" ? (
        <AnnouncementResultView result={parsed.output as AnnouncementResult} />
      ) : (
        <ProfileResult result={parsed.output as ProfileContentResult} />
      )}

      {/* Regenerate */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          ¿No te convence el resultado? Genera otra versión con diferentes parámetros.
        </p>
        <Link
          href={`/content/new?project_id=${(project as { id: string } | null)?.id ?? ""}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Regenerar
        </Link>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <form
          action={async () => {
            "use server"
            const result = await deleteContentAction(id)
            if (!("error" in result)) redirect("/content")
          }}
        >
          <button
            type="submit"
            className={
              buttonVariants({ variant: "outline", size: "sm" }) +
              " border-red-500/30 text-red-400 hover:bg-red-500/10"
            }
          >
            Eliminar contenido
          </button>
        </form>
      </div>
    </div>
  )
}
