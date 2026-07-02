"use server"

import { createClient } from "@/lib/supabase/server"
import { messageSetSchema, type MessageSetFormValues } from "../schemas/message.schema"
import { generateMessageSet } from "@/lib/ai/messages"
import { SECTORS } from "@/constants/navigation"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createMessageSetAction(
  data: MessageSetFormValues
): Promise<{ error: string } | { success: true; contentId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = messageSetSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id, clients(business_name, sector, city)")
    .eq("id", validated.data.project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  const clientData = Array.isArray(project.clients) ? project.clients[0] : project.clients
  const c = clientData as { business_name: string; sector: string; city?: string } | null

  const business_name = c?.business_name ?? "Mi negocio"
  const sector_label  = SECTORS.find((s) => s.value === (c?.sector ?? ""))?.label ?? (c?.sector ?? "Comercio")
  const city          = c?.city ?? undefined

  let aiResult
  try {
    aiResult = await generateMessageSet({
      business_name,
      sector:   sector_label,
      tone:     validated.data.tone,
      schedule: validated.data.schedule,
      city,
      services:           validated.data.services,
      additional_context: validated.data.additional_context,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { error: `Error al generar con IA: ${msg}` }
  }

  const rawOutput = JSON.stringify({
    input: {
      business_name,
      sector: sector_label,
      tone:   validated.data.tone,
      schedule: validated.data.schedule,
      services: validated.data.services,
    },
    output: aiResult,
  })

  const { data: created, error } = await supabase
    .from("generated_content")
    .insert({
      user_id:      user.id,
      project_id:   project.id,
      client_id:    project.client_id,
      content_type: "message_set",
      tone:         validated.data.tone,
      raw_output:   rawOutput,
      is_approved:  false,
      version:      1,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/messages")
  revalidatePath(`/projects/${project.id}`)
  return { success: true, contentId: created.id }
}

export async function toggleMessagePinAction(
  contentId: string,
  itemKey: string,
  pinned: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { data: set } = await supabase
    .from("generated_content")
    .select("pinned_items")
    .eq("id", contentId)
    .eq("user_id", user.id)
    .single()

  if (!set) return { error: "Set no encontrado." }

  const current: string[] = Array.isArray(set.pinned_items) ? set.pinned_items : []
  const next = pinned
    ? Array.from(new Set([...current, itemKey]))
    : current.filter((k) => k !== itemKey)

  const { error } = await supabase
    .from("generated_content")
    .update({ pinned_items: next })
    .eq("id", contentId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/messages/${contentId}`)
  return { success: true }
}

export async function deleteMessageSetAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("generated_content")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("content_type", "message_set")

  if (error) return { error: error.message }

  revalidatePath("/messages")
  return { success: true }
}
