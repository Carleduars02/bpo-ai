"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface SaveMediaInput {
  file_name:    string
  original_url: string
  file_size?:   number
  mime_type?:   string
  width?:       number
  height?:      number
  media_type:   "logo" | "cover" | "product" | "profile" | "other"
  project_id?:  string
  client_id?:   string
}

export async function saveMediaAction(input: SaveMediaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  // Resolve client_id from project if not provided
  let client_id = input.client_id
  if (input.project_id && !client_id) {
    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", input.project_id)
      .eq("user_id", user.id)
      .single()
    client_id = project?.client_id ?? undefined
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      user_id:      user.id,
      file_name:    input.file_name,
      original_url: input.original_url,
      file_size:    input.file_size ?? null,
      mime_type:    input.mime_type ?? null,
      width:        input.width ?? null,
      height:       input.height ?? null,
      media_type:   input.media_type,
      project_id:   input.project_id ?? null,
      client_id:    client_id ?? null,
    })
    .select("id")
    .single()

  if (error) return { error: "Error al guardar la imagen" }

  revalidatePath("/images")
  return { success: true, id: data.id }
}

export async function deleteMediaAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  // Get file URL to delete from storage
  const { data: record } = await supabase
    .from("media")
    .select("original_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!record) return { error: "Imagen no encontrada" }

  // Extract storage path from URL and delete from bucket
  try {
    const url = new URL(record.original_url)
    const pathParts = url.pathname.split("/storage/v1/object/public/media/")
    if (pathParts[1]) {
      await supabase.storage.from("media").remove([pathParts[1]])
    }
  } catch {
    // Continue with DB deletion even if storage delete fails
  }

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Error al eliminar la imagen" }

  revalidatePath("/images")
  return { success: true }
}
