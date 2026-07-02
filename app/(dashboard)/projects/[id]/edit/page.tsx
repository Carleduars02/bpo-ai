import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ProjectForm } from "@/features/projects/components/ProjectForm"
import type { Metadata } from "next"
import type { ProjectFormValues } from "@/features/projects/schemas/project.schema"

export const metadata: Metadata = { title: "Editar proyecto | BPO AI" }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const [{ data: project }, { data: clients }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("clients")
      .select("id, business_name")
      .eq("user_id", user.id)
      .order("business_name"),
  ])

  if (!project) notFound()

  const defaultValues: Partial<ProjectFormValues> = {
    client_id:       project.client_id,
    name:            project.name,
    service_type:    project.service_type ?? undefined,
    objective:       project.objective ?? undefined,
    notes:           project.notes ?? undefined,
    status:          project.status as ProjectFormValues["status"],
    initial_score:   project.initial_score ?? undefined,
    projected_score: project.projected_score ?? undefined,
    delivery_date:   project.delivery_date ?? undefined,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar proyecto</h1>
        <p className="text-sm text-muted-foreground">{project.name}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm
          mode="edit"
          projectId={id}
          clients={clients ?? []}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
