import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { AuditResult } from "@/features/audits/components/AuditResult"
import { deleteAuditAction } from "@/features/audits/actions/audit.actions"
import { ArrowLeft, Calendar, ScanSearch } from "lucide-react"
import type { Metadata } from "next"
import type { AuditIssue, AuditPositive, AuditRecommendation } from "@/lib/ai/audit"
import { PageHero } from "@/components/layout/PageHero"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from("audits").select("business_name_input").eq("id", id).single()
  return { title: data?.business_name_input ? `Auditoría ${data.business_name_input} | BPO AI` : "Auditoría | BPO AI" }
}

export default async function AuditDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const { created } = await searchParams

  const { data: audit } = await supabase
    .from("audits")
    .select("*, projects(id, name), clients(id, business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!audit) notFound()

  const project = Array.isArray(audit.projects) ? audit.projects[0] : audit.projects
  const client  = Array.isArray(audit.clients)  ? audit.clients[0]  : audit.clients

  const breakdown = (audit.scores_breakdown ?? {}) as {
    identity?: number; information?: number; catalog?: number; communication?: number
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {created === "1" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Auditoría generada correctamente con IA.
        </div>
      )}

      {/* Header */}
      <PageHero
        icon={ScanSearch}
        eyebrow={
          <Link
            href={project ? `/projects/${(project as { id: string }).id}` : "/auditor"}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {project ? (project as { name: string }).name : "Auditorías"}
          </Link>
        }
        title={audit.business_name_input || (client as { business_name: string } | null)?.business_name || "Auditoría"}
        subtitle={
          <span className="flex flex-wrap items-center gap-3">
            {(client as { business_name: string } | null)?.business_name && (
              <span>{(client as { business_name: string }).business_name}</span>
            )}
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(audit.created_at).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </span>
          </span>
        }
      />

      {/* Resultados IA */}
      <AuditResult
        auditId={audit.id}
        total_score={audit.total_score}
        scores_breakdown={{
          identity:      breakdown.identity ?? 0,
          information:   breakdown.information ?? 0,
          catalog:       breakdown.catalog ?? 0,
          communication: breakdown.communication ?? 0,
        }}
        ai_diagnosis={audit.ai_diagnosis ?? ""}
        critical_issues={(audit.critical_issues ?? []) as AuditIssue[]}
        moderate_issues={(audit.moderate_issues ?? []) as AuditIssue[]}
        minor_issues={(audit.minor_issues ?? []) as AuditIssue[]}
        positive_aspects={(audit.positive_aspects ?? []) as AuditPositive[]}
        recommendations={(audit.recommendations ?? []) as AuditRecommendation[]}
      />

      {/* Datos del perfil auditado */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Datos ingresados
        </h3>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <DataRow label="Descripción"      value={audit.description_input} />
          <DataRow label="Categoría"        value={audit.category_input} />
          <DataRow label="Horario"          value={audit.has_schedule ? "Configurado" : "No configurado"} />
          <DataRow label="Ubicación"        value={audit.has_location ? "Configurada" : "No configurada"} />
          <DataRow label="Sitio web"        value={audit.has_website ? "Vinculado" : "No vinculado"} />
          <DataRow label="Catálogo"         value={audit.has_catalog ? `Sí — ${audit.catalog_product_count} productos` : "No"} />
          <DataRow label="Bienvenida"       value={audit.has_welcome_message ? "Configurado" : "No"} />
          <DataRow label="Ausencia"         value={audit.has_away_message ? "Configurado" : "No"} />
          <DataRow label="Resp. rápidas"    value={String(audit.quick_replies_count ?? 0)} />
          <DataRow label="Etiquetas"        value={audit.uses_labels ? "Usa etiquetas" : "No usa"} />
        </div>
        {audit.additional_notes && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">Notas</p>
            <p className="mt-1 text-sm text-foreground/80">{audit.additional_notes}</p>
          </div>
        )}
      </div>

      {/* Zona de peligro */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h3>
        <form
          action={async () => {
            "use server"
            const result = await deleteAuditAction(id)
            if (!("error" in result)) {
              redirect("/auditor")
            }
          }}
        >
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " border-red-500/30 text-red-400 hover:bg-red-500/10"}
          >
            Eliminar auditoría
          </button>
        </form>
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="text-foreground/80">{value}</span>
    </div>
  )
}
