import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportForm } from "@/features/reports/components/ReportForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nuevo informe | BPO AI" }

interface PageProps {
  searchParams: Promise<{ project_id?: string }>
}

export default async function NewReportPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { project_id } = await searchParams

  const [{ data: projects }, { data: userProfile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, clients(business_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ])

  if (!projects || projects.length === 0) redirect("/projects/new")

  const normalized = projects.map((p) => ({
    id:      p.id,
    name:    p.name,
    clients: Array.isArray(p.clients)
      ? (p.clients[0] as { business_name: string } | null)
      : (p.clients as { business_name: string } | null),
  }))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo informe PDF</h1>
        <p className="text-sm text-muted-foreground">
          Configura el contenido del PDF que entregarás al cliente.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ReportForm
          projects={normalized}
          defaultProjectId={project_id}
          defaultConsultant={userProfile?.full_name ?? ""}
        />
      </div>
    </div>
  )
}
