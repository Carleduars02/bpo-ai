import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { SERVICE_TYPES } from "@/constants/navigation"
import { ProjectStatusSwitcher } from "@/features/projects/components/ProjectStatusSwitcher"
import { deleteProjectAction } from "@/features/projects/actions/project.actions"
import {
  Edit, Calendar, Target, FileText, ArrowLeft, FolderOpen, TrendingUp,
  ScanSearch, Package, MessageSquare, Wand2, CalendarDays, Plus, ArrowRight,
  Smartphone,
} from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { cn } from "@/lib/utils"

const HOVER_CARD = "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; updated?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from("projects").select("name").eq("id", id).single()
  return { title: data ? `${data.name} | BPO AI` : "Proyecto | BPO AI" }
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const { created, updated } = await searchParams

  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(id, business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!project) notFound()

  const client = project.clients as { id: string; business_name: string } | null
  const serviceLabel = SERVICE_TYPES.find((s) => s.value === project.service_type)?.label

  const [
    { data: latestAudit, count: auditCount },
    { data: catalog },
    { data: latestMessageSet, count: messageSetCount },
    { data: latestContent, count: contentCount },
    { data: upcomingEvents },
    { count: upcomingEventsCount },
    { data: latestReport, count: reportCount },
  ] = await Promise.all([
    supabase
      .from("audits")
      .select("id, total_score, created_at, recommendations", { count: "exact" })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("catalogs")
      .select("id, name")
      .eq("project_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generated_content")
      .select("id, created_at", { count: "exact" })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .eq("content_type", "message_set")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generated_content")
      .select("id, created_at", { count: "exact" })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .eq("content_type", "profile_content")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("calendar_events")
      .select("id, title, scheduled_date")
      .eq("project_id", id)
      .eq("user_id", user.id)
      .eq("is_done", false)
      .order("scheduled_date", { ascending: true })
      .limit(2),
    supabase
      .from("calendar_events")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .eq("is_done", false),
    supabase
      .from("reports")
      .select("id, title, created_at", { count: "exact" })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Evolución de score: con 2+ auditorías, la última refleja el estado actual del perfil
  const currentScore = (auditCount ?? 0) > 1 ? latestAudit?.total_score ?? null : null
  const scoreDelta =
    currentScore != null && project.initial_score != null
      ? currentScore - project.initial_score
      : null

  // Progreso de implementación del plan de acción de la última auditoría
  const latestRecs = (latestAudit?.recommendations ?? []) as { done?: boolean }[]
  const recsDone = latestRecs.filter((r) => r.done).length

  const catalogItemCount = catalog
    ? (await supabase
        .from("catalog_items")
        .select("id", { count: "exact", head: true })
        .eq("catalog_id", catalog.id)
      ).count ?? 0
    : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Banner de éxito */}
      {(created === "1" || updated === "1") && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Proyecto {created === "1" ? "creado" : "actualizado"} correctamente.
        </div>
      )}

      {/* Breadcrumb + acciones */}
      <PageHero
        icon={FolderOpen}
        eyebrow={
          <Link
            href={`/clients/${client?.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {client?.business_name}
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {project.name}
            <ProjectStatusSwitcher projectId={id} status={project.status} />
          </span>
        }
        subtitle={serviceLabel}
        actions={
          <Link
            href={`/projects/${id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        }
      />

      {/* Scores */}
      {(project.initial_score != null || project.projected_score != null || currentScore != null) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {project.initial_score != null && (
            <ScoreCard label="Score inicial" score={project.initial_score} icon={<Target className="h-4 w-4" />} />
          )}
          {currentScore != null && (
            <ScoreCard
              label="Score actual"
              score={currentScore}
              icon={<TrendingUp className="h-4 w-4" />}
              delta={scoreDelta}
            />
          )}
          {project.projected_score != null && (
            <ScoreCard label="Score proyectado" score={project.projected_score} icon={<TrendingUp className="h-4 w-4" />} />
          )}
          {project.delivery_date && (
            <div className={cn("rounded-xl border border-border bg-card p-4 text-center", HOVER_CARD)}>
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">
                {new Date(project.delivery_date).toLocaleDateString("es-ES")}
              </p>
              <p className="text-xs text-muted-foreground">Entrega</p>
            </div>
          )}
        </div>
      )}

      {/* Objetivo */}
      {project.objective && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <SectionTitle icon={<Target className="h-4 w-4" />} colorClass="bg-primary/10 text-primary" title="Objetivo" />
          <p className="text-sm leading-relaxed">{project.objective}</p>
        </div>
      )}

      {/* Hub: herramientas y entregables */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ModuleCard
          icon={<ScanSearch className="h-4 w-4" />}
          colorClass="bg-primary/10 text-primary"
          title="Auditor IA"
          status={
            latestAudit
              ? `Score ${latestAudit.total_score}/100${latestRecs.length > 0 ? ` · ${recsDone}/${latestRecs.length} aplicadas` : ""} · ${new Date(latestAudit.created_at).toLocaleDateString("es-ES")}`
              : "Sin auditoría todavía"
          }
        >
          {latestAudit ? (
            <>
              <Link href={`/auditor/${latestAudit.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                Ver <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              <Link href={`/auditor/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")}>
                Nueva
              </Link>
            </>
          ) : (
            <Link href={`/auditor/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Generar auditoría
            </Link>
          )}
        </ModuleCard>

        <ModuleCard
          icon={<Package className="h-4 w-4" />}
          colorClass="bg-warning/15 text-warning"
          title="Catálogo"
          status={catalog ? `${catalogItemCount} producto${catalogItemCount !== 1 ? "s" : ""}` : "Sin catálogo todavía"}
        >
          {catalog ? (
            <Link href={`/catalog/${catalog.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
              Ver catálogo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link href={`/catalog/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Crear catálogo
            </Link>
          )}
        </ModuleCard>

        <ModuleCard
          icon={<MessageSquare className="h-4 w-4" />}
          colorClass="bg-green-500/10 text-green-400"
          title="Mensajes"
          status={
            latestMessageSet
              ? `${messageSetCount ?? 1} set${(messageSetCount ?? 1) !== 1 ? "s" : ""} · último ${new Date(latestMessageSet.created_at).toLocaleDateString("es-ES")}`
              : "Sin mensajes generados"
          }
        >
          {latestMessageSet ? (
            <>
              <Link href={`/messages/${latestMessageSet.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                Ver <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              {(messageSetCount ?? 0) > 1 && (
                <Link href={`/messages?project_id=${id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                  Ver todos ({messageSetCount})
                </Link>
              )}
              <Link href={`/messages/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")}>
                Nuevo
              </Link>
            </>
          ) : (
            <Link href={`/messages/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Generar mensajes
            </Link>
          )}
        </ModuleCard>

        <ModuleCard
          icon={<Wand2 className="h-4 w-4" />}
          colorClass="bg-blue-500/10 text-blue-400"
          title="Contenido IA"
          status={
            latestContent
              ? `${contentCount ?? 1} generado${(contentCount ?? 1) !== 1 ? "s" : ""} · último ${new Date(latestContent.created_at).toLocaleDateString("es-ES")}`
              : "Sin contenido generado"
          }
        >
          {latestContent ? (
            <>
              <Link href={`/content/${latestContent.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                Ver <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              {(contentCount ?? 0) > 1 && (
                <Link href={`/content?project_id=${id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                  Ver todos ({contentCount})
                </Link>
              )}
              <Link href={`/content/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")}>
                Nuevo
              </Link>
            </>
          ) : (
            <Link href={`/content/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Generar contenido
            </Link>
          )}
        </ModuleCard>

        <ModuleCard
          icon={<Smartphone className="h-4 w-4" />}
          colorClass="bg-purple-500/10 text-purple-400"
          title="Mockups"
          status="Pantallas de WhatsApp con el contenido del proyecto"
        >
          <Link href={`/mockups?project=${id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
            Generar mockups <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </ModuleCard>

        <ModuleCard
          icon={<FileText className="h-4 w-4" />}
          colorClass="bg-red-500/10 text-red-400"
          title="Reporte PDF"
          status={
            latestReport
              ? `${reportCount ?? 1} reporte${(reportCount ?? 1) !== 1 ? "s" : ""} · último ${new Date(latestReport.created_at).toLocaleDateString("es-ES")}`
              : "Sin reportes todavía"
          }
        >
          {latestReport ? (
            <>
              <Link href={`/reports/${latestReport.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}>
                Ver <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              <Link href={`/reports/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")}>
                Nuevo
              </Link>
            </>
          ) : (
            <Link href={`/reports/new?project_id=${id}`} className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Crear reporte
            </Link>
          )}
        </ModuleCard>

        <ModuleCard
          icon={<CalendarDays className="h-4 w-4" />}
          colorClass="bg-accent/15 text-accent"
          title="Calendario"
          status={
            upcomingEventsCount && upcomingEventsCount > 0
              ? `${upcomingEventsCount} evento${upcomingEventsCount !== 1 ? "s" : ""} pendiente${upcomingEventsCount !== 1 ? "s" : ""}`
              : "Sin eventos agendados"
          }
          className="sm:col-span-2"
        >
          <div className="flex w-full flex-col gap-2">
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="space-y-1">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{ev.title}</span>
                    <span className="shrink-0">{new Date(ev.scheduled_date + "T00:00:00").toLocaleDateString("es-ES")}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/calendar?project=${id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
              Ver calendario <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </ModuleCard>
      </div>

      {/* Notas */}
      {project.notes && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <SectionTitle icon={<FileText className="h-4 w-4" />} colorClass="bg-accent/15 text-accent" title="Notas internas" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{project.notes}</p>
        </div>
      )}

      {/* Zona de peligro */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <form
          action={async () => {
            "use server"
            const result = await deleteProjectAction(id)
            if (!("error" in result)) {
              redirect("/projects")
            }
          }}
        >
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " border-red-500/30 text-red-400 hover:bg-red-500/10"}
          >
            Eliminar proyecto
          </button>
        </form>
      </div>
    </div>
  )
}

function ModuleCard({
  icon,
  colorClass,
  title,
  status,
  className,
  children,
}: {
  icon: React.ReactNode
  colorClass: string
  title: string
  status: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-4", HOVER_CARD, className)}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colorClass)}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{status}</p>
        </div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

function ScoreCard({ label, score, icon, delta }: { label: string; score: number; icon: React.ReactNode; delta?: number | null }) {
  const color =
    score >= 80 ? "text-green-400" :
    score >= 60 ? "text-yellow-400" :
    "text-red-400"

  const chipClass =
    score >= 80 ? "bg-green-500/10 text-green-400" :
    score >= 60 ? "bg-yellow-500/10 text-yellow-400" :
    "bg-red-500/10 text-red-400"

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 text-center", HOVER_CARD)}>
      <div className={cn("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg", chipClass)}>
        {icon}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>
        {score}
        {delta != null && delta !== 0 && (
          <span className={cn("ml-1.5 align-middle text-xs font-semibold", delta > 0 ? "text-green-400" : "text-red-400")}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function SectionTitle({
  icon,
  colorClass,
  title,
}: {
  icon: React.ReactNode
  colorClass: string
  title: string
}) {
  return (
    <h2 className="flex items-center gap-3">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        {icon}
      </span>
      <span className="text-base font-bold tracking-tight">{title}</span>
    </h2>
  )
}
