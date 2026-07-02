"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { contentSchema } from "../schemas/content.schema"
import { generateProfileContent, generateStatusPosts, generateAnnouncement } from "@/lib/ai/content"

export async function createContentAction(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const raw = {
    project_id:         formData.get("project_id"),
    format:             formData.get("format") || "profile",
    tone:               formData.get("tone"),
    target_audience:    formData.get("target_audience") || undefined,
    unique_value:       formData.get("unique_value") || undefined,
    additional_context: formData.get("additional_context") || undefined,
    promo_offer:        formData.get("promo_offer") || undefined,
    seasonal_occasion:  formData.get("seasonal_occasion") || undefined,
  }

  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  const { project_id, format, tone, target_audience, unique_value, additional_context, promo_offer, seasonal_occasion } = parsed.data

  // Fetch project + client data
  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(business_name, sector, city)")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado" }

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (!client) return { error: "El proyecto no tiene cliente asociado" }

  const aiInput = {
    business_name:      (client as { business_name: string }).business_name,
    sector:              (client as { sector: string }).sector,
    city:                (client as { city?: string }).city ?? undefined,
    tone,
    target_audience,
    unique_value,
    additional_context,
    promo_offer,
    seasonal_occasion,
  }

  // Call Claude — la función depende del formato elegido
  let aiResult
  try {
    if (format === "status") {
      aiResult = await generateStatusPosts(aiInput)
    } else if (format === "promo") {
      aiResult = await generateAnnouncement(aiInput, "promo")
    } else if (format === "seasonal") {
      aiResult = await generateAnnouncement(aiInput, "seasonal")
    } else {
      aiResult = await generateProfileContent(aiInput)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al llamar a la IA"
    return { error: msg }
  }

  // Save to generated_content
  const { data: record, error: insertError } = await supabase
    .from("generated_content")
    .insert({
      user_id:      user.id,
      project_id,
      client_id:    project.client_id,
      content_type: "profile_content",
      tone,
      raw_output: JSON.stringify({
        format,
        input:  { tone, target_audience, unique_value, additional_context, promo_offer, seasonal_occasion },
        output: aiResult,
      }),
    })
    .select("id")
    .single()

  if (insertError || !record) {
    return { error: insertError?.message ?? "Error al guardar el contenido" }
  }

  revalidatePath("/content")
  redirect(`/content/${record.id}`)
}

export async function deleteContentAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("generated_content")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("content_type", "profile_content")

  if (error) return { error: "Error al eliminar" }

  revalidatePath("/content")
  return { success: true }
}

export async function listContentAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("generated_content")
    .select("id, tone, created_at, projects(id, name), clients(business_name)")
    .eq("user_id", user.id)
    .eq("content_type", "profile_content")
    .order("created_at", { ascending: false })

  return data ?? []
}
