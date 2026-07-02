"use server"

import { createClient } from "@/lib/supabase/server"
import { reportSchema, type ReportFormValues } from "../schemas/report.schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createReportAction(
  data: ReportFormValues
): Promise<{ error: string } | { success: true; reportId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = reportSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", validated.data.project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  const { data: created, error } = await supabase
    .from("reports")
    .insert({
      user_id:    user.id,
      project_id: project.id,
      client_id:  project.client_id,
      title:      validated.data.title,
      sections:   validated.data.sections,
      config:     { consultant_name: validated.data.consultant_name ?? "" },
      status:     "draft",
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/reports")
  return { success: true, reportId: created.id }
}

export async function deleteReportAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/reports")
  return { success: true }
}
