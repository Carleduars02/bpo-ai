import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProjectForm } from "@/features/projects/components/ProjectForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nuevo proyecto | BPO AI" }

interface PageProps {
  searchParams: Promise<{ client_id?: string }>
}

export default async function NewProjectPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { client_id } = await searchParams

  const { data: clients } = await supabase
    .from("clients")
    .select("id, business_name")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("business_name")

  if (!clients || clients.length === 0) {
    redirect("/clients/new")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo proyecto</h1>
        <p className="text-sm text-muted-foreground">
          Define el alcance y los objetivos del proyecto de optimización.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm
          mode="create"
          clients={clients}
          defaultValues={client_id ? { client_id } : undefined}
        />
      </div>
    </div>
  )
}
