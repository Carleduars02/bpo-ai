import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getTemplateById } from "@/constants/templates-data"
import { ApplyTemplateForm } from "@/features/templates/components/ApplyTemplateForm"
import { ArrowLeft, BookOpen, AlertTriangle, MessageSquare, Package, Lightbulb } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/CopyButton"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const template = getTemplateById(id)
  return { title: template ? `${template.name} | Plantillas — BPO AI` : "Plantilla | BPO AI" }
}

// ── Static copy button (server-rendered, no interactivity needed here)
function PreviewBadge({ label }: { label: string }) {
  return (
    <span className="rounded-sm border border-border bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {label}
    </span>
  )
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params
  const template = getTemplateById(id)
  if (!template) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name)")
    .eq("user_id", user.id)
    .in("status", ["pending", "in_progress", "review"])
    .order("created_at", { ascending: false })

  const normalizedProjects = (projects ?? []).map((p) => ({
    id:      p.id,
    name:    p.name,
    clients: Array.isArray(p.clients)
      ? (p.clients[0] as { business_name: string } | null)
      : (p.clients as { business_name: string } | null),
  }))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/templates"
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Plantillas
        </Link>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{template.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <PreviewBadge label={`${template.messages.welcome_messages.length} mensajes de bienvenida`} />
              <PreviewBadge label={`${template.messages.quick_replies.length} respuestas rápidas`} />
              <PreviewBadge label={`${template.messages.status_texts.length} textos de estado`} />
              <PreviewBadge label={`${template.catalog_items.length} productos base`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: content preview */}
        <div className="space-y-6 lg:col-span-2">

          {/* Perfil base */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Perfil base
            </h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Nombre de ejemplo</p>
                  <CopyButton text={template.profile.example_name} />
                </div>
                <p className="text-sm font-medium">{template.profile.example_name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Descripción corta (perfil WA)</p>
                  <span className="text-[10px] text-muted-foreground">
                    {template.profile.short_description.length}/139 car.
                  </span>
                </div>
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm leading-relaxed">
                  {template.profile.short_description}
                </p>
                <CopyButton text={template.profile.short_description} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Descripción larga</p>
                  <span className="text-[10px] text-muted-foreground">
                    {template.profile.long_description.length}/500 car.
                  </span>
                </div>
                <p className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm leading-relaxed">
                  {template.profile.long_description}
                </p>
                <CopyButton text={template.profile.long_description} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Palabras clave</p>
                  <CopyButton text={template.profile.keywords.join(", ")} label="Copiar todas" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {template.profile.keywords.map((kw, i) => (
                    <span key={i} className="rounded-md border border-border bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Mensajes */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Mensajes
              </h2>
            </div>

            {/* Welcome */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Bienvenida ({template.messages.welcome_messages.length} variaciones)</p>
              <div className="space-y-2">
                {template.messages.welcome_messages.map((msg, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-foreground/80">{msg}</p>
                    <CopyButton text={msg} />
                  </div>
                ))}
              </div>
            </div>

            {/* Away */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Mensaje de ausencia</p>
              <div className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-foreground/80">{template.messages.away_message}</p>
                <CopyButton text={template.messages.away_message} />
              </div>
            </div>

            {/* Quick replies preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Respuestas rápidas ({template.messages.quick_replies.length})
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="py-2 pl-3 text-left font-medium text-muted-foreground w-28">Atajo</th>
                      <th className="py-2 pl-3 pr-3 text-left font-medium text-muted-foreground">Mensaje</th>
                      <th className="w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {template.messages.quick_replies.map((qr, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pl-3 font-mono text-primary align-top">{qr.title}</td>
                        <td className="py-2 pl-3 pr-3 text-foreground/70 leading-relaxed align-top">{qr.message}</td>
                        <td className="py-2 pr-3 align-top">
                          <CopyButton text={qr.message} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status texts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Textos de estado ({template.messages.status_texts.length})
              </p>
              <div className="space-y-2">
                {template.messages.status_texts.map((st, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded-sm border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
                      {st.type}
                    </span>
                    <p className="flex-1 text-xs leading-relaxed text-foreground/70">{st.text}</p>
                    <CopyButton text={st.text} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Catálogo */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Catálogo base
              </h2>
            </div>
            <div className="space-y-2">
              {template.catalog_items.map((item, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.category && (
                        <span className="text-[10px] text-muted-foreground">{item.category}</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.price != null && (
                        <span className="text-sm font-semibold text-primary">${item.price}</span>
                      )}
                      <CopyButton text={[item.name, item.description, item.cta].filter(Boolean).join(" — ")} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-foreground/70 leading-relaxed">{item.description}</p>
                  {item.cta && (
                    <p className="mt-1 text-[10px] text-primary/80 italic">{item.cta}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Estrategia */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Estrategia del sector
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{template.strategy}</p>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-semibold text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Errores más comunes en este sector
              </p>
              <ul className="space-y-1.5">
                {template.common_mistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/70 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/60" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Right column: apply */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
              <div>
                <h3 className="font-semibold">Aplicar plantilla</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Crea mensajes, catálogo o contenido de perfil basados en esta plantilla directamente en el proyecto que elijas.
                </p>
              </div>

              {normalizedProjects.length > 0 ? (
                <ApplyTemplateForm
                  templateId={template.id}
                  projects={normalizedProjects}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    No tienes proyectos activos. Crea uno primero para aplicar la plantilla.
                  </p>
                  <Link href="/projects/new" className={buttonVariants({ size: "sm", className: "w-full" })}>
                    Crear proyecto
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
              <p className="text-xs font-medium">También puedes usar...</p>
              <Link
                href="/messages/new"
                className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
              >
                <MessageSquare className="mr-2 h-3 w-3" />
                Generar mensajes con IA
              </Link>
              <p className="text-[11px] text-muted-foreground">
                Para mensajes 100% personalizados al negocio específico del cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
