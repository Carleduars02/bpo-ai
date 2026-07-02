"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { projectSchema, type ProjectFormValues } from "../schemas/project.schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProjectAction(
  data: ProjectFormValues
): Promise<{ error: string } | { success: true; projectId: string }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = projectSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { data: created, error } = await supabase
    .from("projects")
    .insert({ ...validated.data, user_id: user.id })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/projects")
  revalidatePath(`/clients/${validated.data.client_id}`)
  return { success: true, projectId: created.id }
}

export async function updateProjectAction(
  id: string,
  data: ProjectFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = projectSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { error } = await supabase
    .from("projects")
    .update({ ...validated.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  revalidatePath(`/clients/${validated.data.client_id}`)
  return { success: true }
}

export async function updateProjectStatusAction(
  id: string,
  status: "pending" | "in_progress" | "review" | "completed" | "archived"
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  return { success: true }
}

export async function bulkUpdateProjectStatusAction(
  ids: string[],
  status: "pending" | "in_progress" | "review" | "completed" | "archived"
): Promise<{ error: string } | { success: true; count: number }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }
  if (ids.length === 0) return { error: "Nada seleccionado." }

  const { error, count } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() }, { count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true, count: count ?? ids.length }
}

export async function bulkDeleteProjectsAction(
  ids: string[]
): Promise<{ error: string } | { success: true; count: number }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }
  if (ids.length === 0) return { error: "Nada seleccionado." }

  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true, count: count ?? ids.length }
}

export async function deleteProjectAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  if (project?.client_id) revalidatePath(`/clients/${project.client_id}`)
  return { success: true }
}
