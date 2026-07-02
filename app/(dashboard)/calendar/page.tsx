import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarView } from "@/features/calendar/components/CalendarView"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { CalendarDays } from "lucide-react"

export const metadata: Metadata = { title: "Calendario | BPO AI" }

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string; project?: string }>
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { year: yearParam, month: monthParam, project: projectFilter } = await searchParams

  const now   = new Date()
  const year  = yearParam  ? parseInt(yearParam, 10)  : now.getUTCFullYear()
  const month = monthParam ? parseInt(monthParam, 10) : now.getUTCMonth() + 1 // 1-12

  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`
  const lastDay       = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const lastOfMonth    = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients(business_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let query = supabase
    .from("calendar_events")
    .select("id, project_id, title, event_type, notes, scheduled_date, recurrence, recurrence_group_id, is_done, clients(business_name)")
    .eq("user_id", user.id)
    .gte("scheduled_date", firstOfMonth)
    .lte("scheduled_date", lastOfMonth)
    .order("scheduled_date", { ascending: true })

  if (projectFilter) {
    query = query.eq("project_id", projectFilter)
  }

  const { data: events } = await query

  const normalizedProjects = (projects ?? []).map((p) => {
    const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
    return {
      id:           p.id,
      name:         p.name,
      businessName: (client as { business_name: string } | null)?.business_name ?? "—",
    }
  })

  const normalizedEvents = (events ?? []).map((e) => {
    const client = Array.isArray(e.clients) ? e.clients[0] : e.clients
    return {
      id:                  e.id,
      project_id:          e.project_id,
      title:               e.title,
      event_type:          e.event_type,
      notes:               e.notes,
      scheduled_date:      e.scheduled_date,
      recurrence:          e.recurrence,
      recurrence_group_id: e.recurrence_group_id,
      is_done:             e.is_done,
      businessName:        (client as { business_name: string } | null)?.business_name ?? "—",
    }
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHero
        icon={CalendarDays}
        title="Calendario"
        subtitle="Seguimiento de clientes: agendá fechas de entrega, reuniones y dejá notas importantes de cada uno."
      />

      <CalendarView
        year={year}
        month={month}
        projectFilter={projectFilter ?? ""}
        projects={normalizedProjects}
        events={normalizedEvents}
      />
    </div>
  )
}
