import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { Smartphone } from "lucide-react"
import { MockupBuilder, type MockupProject } from "@/features/mockups/components/MockupBuilder"
import { SECTORS } from "@/constants/navigation"

export const metadata: Metadata = { title: "Mockups | BPO AI" }

interface WelcomeMessageShape {
  label?: string
  text?:  string
}

function firstWelcomeMessage(rawOutput: string): string | null {
  try {
    const parsed = JSON.parse(rawOutput) as { output?: { welcome_messages?: (WelcomeMessageShape | string)[] } }
    const first = parsed.output?.welcome_messages?.[0]
    if (!first) return null
    return typeof first === "string" ? first : first.text ?? null
  } catch {
    return null
  }
}

interface PageProps {
  searchParams: Promise<{ project?: string }>
}

export default async function MockupsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project: initialProjectId } = await searchParams

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name, description, sector, city, website, whatsapp_phone, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!projects || projects.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHero
          icon={Smartphone}
          title="Mockups"
          subtitle="Genera imágenes de las pantallas de WhatsApp Business con el contenido real de tus proyectos."
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Smartphone className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Necesitas al menos un proyecto</p>
          <p className="mt-1 text-xs text-muted-foreground">Crea un proyecto para poder generar mockups.</p>
        </div>
      </div>
    )
  }

  const projectIds = projects.map((p) => p.id)

  const [{ data: media }, { data: messageSets }, { data: catalogs }] = await Promise.all([
    supabase
      .from("media")
      .select("project_id, original_url, media_type, created_at")
      // logo/profile → foto de perfil; cover → portada del catálogo
      .eq("user_id", user.id)
      .in("project_id", projectIds)
      .in("media_type", ["logo", "profile", "cover"])
      .order("created_at", { ascending: false }),
    supabase
      .from("generated_content")
      .select("project_id, raw_output, created_at")
      .eq("user_id", user.id)
      .in("project_id", projectIds)
      .eq("content_type", "message_set")
      .order("created_at", { ascending: false }),
    supabase
      .from("catalogs")
      .select("id, project_id, name, created_at")
      .eq("user_id", user.id)
      .in("project_id", projectIds)
      .order("created_at", { ascending: false }),
  ])

  const avatarByProject: Record<string, string> = {}
  const coverByProject:  Record<string, string> = {}
  for (const m of media ?? []) {
    if (m.media_type === "cover") {
      if (!coverByProject[m.project_id]) coverByProject[m.project_id] = m.original_url
    } else if (!avatarByProject[m.project_id]) {
      avatarByProject[m.project_id] = m.original_url
    }
  }

  const welcomeByProject: Record<string, string> = {}
  for (const m of messageSets ?? []) {
    if (welcomeByProject[m.project_id]) continue
    const text = firstWelcomeMessage(m.raw_output)
    if (text) welcomeByProject[m.project_id] = text
  }

  const catalogByProject: Record<string, { id: string; name: string }> = {}
  for (const c of catalogs ?? []) {
    if (!catalogByProject[c.project_id]) catalogByProject[c.project_id] = { id: c.id, name: c.name }
  }

  const catalogIds = Object.values(catalogByProject).map((c) => c.id)
  const { data: catalogItems } = catalogIds.length
    ? await supabase
        .from("catalog_items")
        .select("catalog_id, name, description, price, currency, image_url")
        .in("catalog_id", catalogIds)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
    : { data: [] }

  const itemsByCatalog: Record<string, { name: string; description: string | null; price: number | null; currency: string | null; imageUrl: string | null }[]> = {}
  for (const item of catalogItems ?? []) {
    const list = itemsByCatalog[item.catalog_id] ?? []
    list.push({ name: item.name, description: item.description, price: item.price != null ? Number(item.price) : null, currency: item.currency, imageUrl: item.image_url })
    itemsByCatalog[item.catalog_id] = list
  }

  const mockupProjects: MockupProject[] = projects.map((p) => {
    const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
    const c = client as { business_name: string; description: string | null; sector: string | null; city: string | null; website: string | null; whatsapp_phone: string | null; email: string | null } | null
    const catalog = catalogByProject[p.id]
    return {
      id:             p.id,
      name:           p.name,
      businessName:   c?.business_name ?? p.name,
      description:    c?.description,
      sector:         c?.sector ? (SECTORS.find((s) => s.value === c.sector)?.label ?? c.sector) : null,
      city:           c?.city,
      website:        c?.website,
      phone:          c?.whatsapp_phone,
      email:          c?.email,
      avatarUrl:      avatarByProject[p.id] ?? null,
      coverUrl:       coverByProject[p.id] ?? null,
      welcomeMessage: welcomeByProject[p.id] ?? null,
      catalogName:    catalog?.name ?? null,
      catalogItems:   catalog ? itemsByCatalog[catalog.id] ?? [] : [],
    }
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        icon={Smartphone}
        title="Mockups"
        subtitle="Genera imágenes de las pantallas de WhatsApp Business con el contenido real de tus proyectos."
      />
      <MockupBuilder projects={mockupProjects} userId={user.id} initialProjectId={initialProjectId} />
    </div>
  )
}
