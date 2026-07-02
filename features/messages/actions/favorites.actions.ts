"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type FavoriteCategory = "welcome" | "away" | "quick_reply" | "status"

export interface MessageFavorite {
  id:         string
  category:   FavoriteCategory
  label:      string | null
  text:       string
  created_at: string
}

export async function saveMessageFavoriteAction(
  projectId: string,
  category:  FavoriteCategory,
  label:     string | null,
  text:      string
): Promise<{ error: string } | { success: true; id: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  if (!text.trim()) return { error: "El mensaje está vacío." }

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  const { data: created, error } = await supabase
    .from("message_favorites")
    .insert({
      user_id:    user.id,
      project_id: project.id,
      client_id:  project.client_id,
      category,
      label,
      text,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/messages/favorites")
  return { success: true, id: created.id }
}

export async function deleteMessageFavoriteAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("message_favorites")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/messages/favorites")
  return { success: true }
}
