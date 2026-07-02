"use server"

import { createClient } from "@/lib/supabase/server"
import { SECTORS } from "@/constants/navigation"

export type SearchResultType = "client" | "project" | "audit" | "catalog" | "message" | "content"

export interface SearchResult {
  id:       string
  type:     SearchResultType
  title:    string
  subtitle: string
  href:     string
}

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [{ data: clients }, { data: projects }, { data: audits }, { data: catalogs }, { data: messages }, { data: contents }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, business_name, sector")
      .eq("user_id", user.id)
      .ilike("business_name", `%${q}%`)
      .limit(5),
    supabase
      .from("projects")
      .select("id, name, clients(business_name)")
      .eq("user_id", user.id)
      .ilike("name", `%${q}%`)
      .limit(5),
    supabase
      .from("audits")
      .select("id, business_name_input, total_score, clients(business_name)")
      .eq("user_id", user.id)
      .ilike("business_name_input", `%${q}%`)
      .limit(5),
    supabase
      .from("catalogs")
      .select("id, name, clients(business_name)")
      .eq("user_id", user.id)
      .ilike("name", `%${q}%`)
      .limit(5),
    supabase
      .from("generated_content")
      .select("id, tone, created_at, projects!inner(id, name), clients(business_name)")
      .eq("user_id", user.id)
      .eq("content_type", "message_set")
      .ilike("projects.name", `%${q}%`)
      .limit(5),
    supabase
      .from("generated_content")
      .select("id, tone, created_at, projects!inner(id, name), clients(business_name)")
      .eq("user_id", user.id)
      .eq("content_type", "profile_content")
      .ilike("projects.name", `%${q}%`)
      .limit(5),
  ])

  const results: SearchResult[] = []

  for (const c of clients ?? []) {
    const sectorLabel = SECTORS.find((s) => s.value === c.sector)?.label ?? c.sector
    results.push({ id: c.id, type: "client", title: c.business_name, subtitle: sectorLabel ?? "Cliente", href: `/clients/${c.id}` })
  }

  for (const p of projects ?? []) {
    const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
    results.push({
      id: p.id, type: "project", title: p.name,
      subtitle: (client as { business_name: string } | null)?.business_name ?? "Proyecto",
      href: `/projects/${p.id}`,
    })
  }

  for (const a of audits ?? []) {
    const client = Array.isArray(a.clients) ? a.clients[0] : a.clients
    results.push({
      id: a.id, type: "audit", title: a.business_name_input || (client as { business_name: string } | null)?.business_name || "Auditoría",
      subtitle: `Score ${a.total_score}/100`,
      href: `/auditor/${a.id}`,
    })
  }

  for (const cat of catalogs ?? []) {
    const client = Array.isArray(cat.clients) ? cat.clients[0] : cat.clients
    results.push({
      id: cat.id, type: "catalog", title: cat.name,
      subtitle: (client as { business_name: string } | null)?.business_name ?? "Catálogo",
      href: `/catalog/${cat.id}`,
    })
  }

  for (const m of messages ?? []) {
    const project = Array.isArray(m.projects) ? m.projects[0] : m.projects
    const client = Array.isArray(m.clients) ? m.clients[0] : m.clients
    results.push({
      id: m.id, type: "message",
      title: `Mensajes — ${(project as { name: string } | null)?.name ?? "Proyecto"}`,
      subtitle: (client as { business_name: string } | null)?.business_name ?? m.tone ?? "Mensajes",
      href: `/messages/${m.id}`,
    })
  }

  for (const c of contents ?? []) {
    const project = Array.isArray(c.projects) ? c.projects[0] : c.projects
    const client = Array.isArray(c.clients) ? c.clients[0] : c.clients
    results.push({
      id: c.id, type: "content",
      title: `Contenido — ${(project as { name: string } | null)?.name ?? "Proyecto"}`,
      subtitle: (client as { business_name: string } | null)?.business_name ?? c.tone ?? "Contenido",
      href: `/content/${c.id}`,
    })
  }

  return results
}
