import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { SECTORS, PROJECT_STATUS_LABELS } from "@/constants/navigation"
import { ClientStatusSwitcher } from "@/features/clients/components/ClientStatusSwitcher"
import {
  Phone,
  Globe,
  MapPin,
  Mail,
  MessageSquare,
  Edit,
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { Metadata } from "next"
import { deleteClientAction } from "@/features/clients/actions/client.actions"
import { cn } from "@/lib/utils"

const HOVER_CARD = "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from("clients").select("business_name").eq("id", id).single()
  return { title: data ? `${data.business_name} | BPO AI` : "Cliente | BPO AI" }
}

export default async function ClientProfilePage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const { updated } = await searchParams

  const [{ data: client }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("projects")
      .select("id, name, status, initial_score, created_at, delivery_date")
      .eq("client_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (!client) notFound()

  const sectorLabel = SECTORS.find((s) => s.value === client.sector)?.label ?? client.sector
  const completedProjects = projects?.filter((p) => p.status === "completed").length ?? 0
  const avgScore =
    projects && projects.length > 0
      ? Math.round(
          projects
            .filter((p) => p.initial_score)
            .reduce((acc, p) => acc + (p.initial_score ?? 0), 0) /
            Math.max(projects.filter((p) => p.initial_score).length, 1)
        )
      : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Banner de éxito */}
      {updated === "1" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Cliente actualizado correctamente.
        </div>
      )}

      {/* Cabecera */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/25 to-accent/15 text-xl font-bold text-primary shadow-[0_0_14px_-2px_var(--primary)]">
              {client.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{client.business_name}</h1>
                <ClientStatusSwitcher clientId={id} status={client.status} />
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{sectorLabel}</span>
                {client.owner_name && (
                  <>
                    <span>·</span>
                    <span>{client.owner_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/clients/${id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
            <Link
              href={`/projects/new?client_id=${id}`}
              className={cn(buttonVariants({ size: "sm" }), "shadow-[0_0_16px_-4px_var(--primary)]")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo proyecto
            </Link>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Proyectos"
          value={projects?.length ?? 0}
          icon={<FolderOpen className="h-4 w-4" />}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Completados"
          value={completedProjects}
          icon={<FileText className="h-4 w-4" />}
          colorClass="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="Score prom."
          value={avgScore !== null ? `${avgScore}/100` : "—"}
          icon={<span className="text-xs font-bold">IA</span>}
          colorClass="bg-accent/15 text-accent"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna izquierda: Contacto + Gestión */}
        <div className="min-w-0 space-y-4 md:col-span-1">
          {/* Contacto */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <SectionTitle icon={<Phone className="h-3.5 w-3.5" />} colorClass="bg-primary/10 text-primary" title="Contacto" />
            {client.whatsapp_phone && (
              <InfoRow icon={<Phone className="h-4 w-4" />} label={client.whatsapp_phone} />
            )}
            {client.email && (
              <InfoRow icon={<Mail className="h-4 w-4" />} label={client.email} />
            )}
            {client.city && (
              <InfoRow icon={<MapPin className="h-4 w-4" />} label={client.city} />
            )}
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
            {client.whatsapp_link && (
              <a
                href={client.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-400 hover:underline"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">Link de WhatsApp</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
            {!client.whatsapp_phone && !client.email && !client.city && !client.website && (
              <p className="text-xs text-muted-foreground">Sin datos de contacto.</p>
            )}
          </div>

          {/* Gestión interna */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <SectionTitle icon={<DollarSign className="h-3.5 w-3.5" />} colorClass="bg-accent/15 text-accent" title="Gestión" />
            {client.price != null && client.price > 0 && (
              <InfoRow
                icon={<DollarSign className="h-4 w-4" />}
                label={`$${Number(client.price).toFixed(2)} USD`}
              />
            )}
            {client.next_followup && (
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label={`Seguimiento: ${new Date(client.next_followup).toLocaleDateString("es-ES")}`}
              />
            )}
            {client.notes && (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            )}
          </div>
        </div>

        {/* Columna derecha: Descripción + Proyectos */}
        <div className="min-w-0 space-y-4 md:col-span-2">
          {/* Descripción */}
          {client.description && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <SectionTitle icon={<FileText className="h-3.5 w-3.5" />} colorClass="bg-primary/10 text-primary" title="Descripción" />
              <p className="text-sm leading-relaxed text-foreground/80">{client.description}</p>
            </div>
          )}

          {/* Proyectos */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle icon={<FolderOpen className="h-3.5 w-3.5" />} colorClass="bg-green-500/10 text-green-400" title="Proyectos" />
              <Link
                href={`/projects/new?client_id=${id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Plus className="mr-1 h-3 w-3" />
                Nuevo
              </Link>
            </div>

            {!projects || projects.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <FolderOpen className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sin proyectos todavía.</p>
                <Link
                  href={`/projects/new?client_id=${id}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" }) + " mt-2"}
                >
                  Crear primer proyecto
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-accent/20"
                  >
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                        {project.delivery_date && (
                          <> · entrega {new Date(project.delivery_date).toLocaleDateString("es-ES")}</>
                        )}
                      </p>
                    </div>
                    {project.initial_score != null && (
                      <ScoreBadge score={project.initial_score} />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones peligrosas */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Para archivar o reactivar este cliente, usa la etiqueta de estado junto al nombre arriba.
          Esto elimina el cliente de forma permanente, junto con sus proyectos, catálogos y mensajes asociados.
        </p>
        <form
          action={async () => {
            "use server"
            const result = await deleteClientAction(id)
            if (!("error" in result)) {
              redirect("/clients")
            }
          }}
        >
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " border-red-500/30 text-red-400 hover:bg-red-500/10"}
          >
            Eliminar cliente
          </button>
        </form>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 text-center", HOVER_CARD)}>
      <div className={cn("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg", colorClass)}>
        {icon}
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
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
    <h2 className="flex items-center gap-2.5">
      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{title}</span>
    </h2>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-400 bg-green-500/10" :
    score >= 60 ? "text-yellow-400 bg-yellow-500/10" :
    "text-red-400 bg-red-500/10"

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}
    </span>
  )
}
