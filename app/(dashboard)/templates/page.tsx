import Link from "next/link"
import { SYSTEM_TEMPLATES } from "@/constants/templates-data"
import {
  UtensilsCrossed, Scissors, Dumbbell, Briefcase,
  Cake, ShoppingBag, GraduationCap, Megaphone,
  BookOpen, ChevronRight,
} from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = { title: "Plantillas | BPO AI" }

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Scissors, Dumbbell, Briefcase,
  Cake, ShoppingBag, GraduationCap, Megaphone, BookOpen,
}

const SECTOR_GROUPS: { label: string; sectors: string[] }[] = [
  { label: "Alimentos",       sectors: ["restaurant", "bar", "catering", "bakery", "delivery"] },
  { label: "Belleza",         sectors: ["salon", "barbershop", "spa", "nails"] },
  { label: "Salud & Fitness", sectors: ["gym", "veterinary", "nutrition", "massage"] },
  { label: "Profesionales",   sectors: ["consultant", "marketing", "lawyer", "accountant", "architect"] },
  { label: "Comercio",        sectors: ["clothing", "tech", "flowers", "pharmacy"] },
  { label: "Educación",       sectors: ["tutoring", "language", "institute"] },
]

export default function TemplatesPage() {
  const grouped = SECTOR_GROUPS
    .map((group) => ({
      ...group,
      templates: SYSTEM_TEMPLATES.filter((t) => group.sectors.includes(t.sector)),
    }))
    .filter((g) => g.templates.length > 0)

  const ungrouped = SYSTEM_TEMPLATES.filter(
    (t) => !SECTOR_GROUPS.flatMap((g) => g.sectors).includes(t.sector)
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHero
        icon={BookOpen}
        title="Biblioteca de Plantillas"
        subtitle={`${SYSTEM_TEMPLATES.length} plantillas con mensajes, catálogo y estrategia por sector. Aplícalas a cualquier proyecto en un clic.`}
      />

      {grouped.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {group.label}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.templates.map((template) => {
              const Icon = ICON_MAP[template.icon] ?? BookOpen
              return (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{template.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-sm border border-border bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {template.messages.welcome_messages.length} bienvenidas
                      </span>
                      <span className="rounded-sm border border-border bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {template.messages.quick_replies.length} respuestas rápidas
                      </span>
                      <span className="rounded-sm border border-border bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {template.catalog_items.length} productos base
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1" />
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {ungrouped.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Otros sectores
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {ungrouped.map((template) => {
              const Icon = ICON_MAP[template.icon] ?? BookOpen
              return (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{template.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary mt-1" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="rounded-lg border border-border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">¿No encuentras tu sector?</span>{" "}
          Las plantillas se expanden continuamente. Usa el{" "}
          <Link href="/messages/new" className="text-primary underline-offset-2 hover:underline">
            Generador de Mensajes IA
          </Link>{" "}
          para crear mensajes personalizados para cualquier rubro.
        </p>
      </div>
    </div>
  )
}
