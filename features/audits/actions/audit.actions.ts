"use server"

import { createClient } from "@/lib/supabase/server"
import { auditSchema, type AuditFormValues } from "../schemas/audit.schema"
import { runAudit } from "@/lib/ai/audit"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createAuditAction(
  data: AuditFormValues
): Promise<{ error: string } | { success: true; auditId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = auditSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", validated.data.project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  let aiResult
  try {
    aiResult = await runAudit({
      profile_photo_url:    validated.data.profile_photo_url,
      business_name_input:  validated.data.business_name_input,
      description_input:    validated.data.description_input,
      category_input:       validated.data.category_input,
      has_schedule:         validated.data.has_schedule,
      has_location:         validated.data.has_location,
      has_website:          validated.data.has_website,
      has_catalog:          validated.data.has_catalog,
      catalog_product_count: validated.data.catalog_product_count,
      catalog_quality:      validated.data.catalog_quality,
      has_welcome_message:  validated.data.has_welcome_message,
      has_away_message:     validated.data.has_away_message,
      quick_replies_count:  validated.data.quick_replies_count,
      posts_status:         validated.data.posts_status,
      status_frequency:     validated.data.status_frequency,
      uses_labels:          validated.data.uses_labels,
      additional_notes:     validated.data.additional_notes,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { error: `Error al procesar con IA: ${msg}` }
  }

  const { data: created, error } = await supabase
    .from("audits")
    .insert({
      user_id:    user.id,
      project_id: project.id,
      client_id:  project.client_id,
      // Form inputs
      profile_photo_url:     validated.data.profile_photo_url,
      business_name_input:   validated.data.business_name_input,
      description_input:     validated.data.description_input,
      category_input:        validated.data.category_input,
      has_schedule:          validated.data.has_schedule,
      has_location:          validated.data.has_location,
      has_website:           validated.data.has_website,
      has_catalog:           validated.data.has_catalog,
      catalog_product_count: validated.data.catalog_product_count,
      catalog_quality:       validated.data.catalog_quality,
      has_welcome_message:   validated.data.has_welcome_message,
      has_away_message:      validated.data.has_away_message,
      quick_replies_count:   validated.data.quick_replies_count,
      posts_status:          validated.data.posts_status,
      status_frequency:      validated.data.status_frequency,
      uses_labels:           validated.data.uses_labels,
      additional_notes:      validated.data.additional_notes,
      // AI results
      total_score:      aiResult.total_score,
      scores_breakdown: aiResult.scores_breakdown,
      ai_diagnosis:     aiResult.ai_diagnosis,
      critical_issues:  aiResult.critical_issues,
      moderate_issues:  aiResult.moderate_issues,
      minor_issues:     aiResult.minor_issues,
      positive_aspects: aiResult.positive_aspects,
      recommendations:  aiResult.recommendations,
      status:           "completed",
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  // Si es la primera auditoría del proyecto, registrarla como score inicial
  // para poder demostrar la evolución antes/después al cliente.
  const { count: auditCount } = await supabase
    .from("audits")
    .select("id", { count: "exact", head: true })
    .eq("project_id", project.id)
    .eq("user_id", user.id)

  if (auditCount === 1) {
    await supabase
      .from("projects")
      .update({ initial_score: aiResult.total_score, updated_at: new Date().toISOString() })
      .eq("id", project.id)
      .eq("user_id", user.id)
  }

  revalidatePath("/auditor")
  revalidatePath(`/projects/${project.id}`)
  return { success: true, auditId: created.id }
}

export async function toggleRecommendationAction(
  auditId: string,
  index: number,
  done: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: audit } = await supabase
    .from("audits")
    .select("project_id, recommendations")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single()

  if (!audit) return { error: "Auditoría no encontrada." }

  const recommendations = Array.isArray(audit.recommendations) ? [...audit.recommendations] : []
  if (index < 0 || index >= recommendations.length) return { error: "Recomendación inválida." }

  recommendations[index] = { ...recommendations[index], done }

  const { error } = await supabase
    .from("audits")
    .update({ recommendations })
    .eq("id", auditId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/auditor/${auditId}`)
  if (audit.project_id) revalidatePath(`/projects/${audit.project_id}`)
  return { success: true }
}

export async function deleteAuditAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: audit } = await supabase
    .from("audits")
    .select("project_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase
    .from("audits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/auditor")
  if (audit?.project_id) revalidatePath(`/projects/${audit.project_id}`)
  return { success: true }
}
