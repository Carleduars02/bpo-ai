"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { clientSchema, type ClientFormValues } from "../schemas/client.schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createClientAction(
  data: ClientFormValues
): Promise<{ error: string } | { success: true; clientId: string }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = clientSchema.safeParse(data)
  if (!validated.success) {
    return { error: "Datos inválidos. Revisa el formulario." }
  }

  // Garantizar que el perfil existe antes de la FK
  await supabase.from("users").upsert(
    { id: user.id, email: user.email! },
    { onConflict: "id", ignoreDuplicates: true }
  )

  const { data: created, error } = await supabase
    .from("clients")
    .insert({ ...validated.data, user_id: user.id })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/clients")
  return { success: true, clientId: created.id }
}

export async function updateClientAction(
  id: string,
  data: ClientFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = clientSchema.safeParse(data)
  if (!validated.success) {
    return { error: "Datos inválidos. Revisa el formulario." }
  }

  const { error } = await supabase
    .from("clients")
    .update({ ...validated.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function updateClientStatusAction(
  id: string,
  status: "active" | "potential" | "archived"
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("clients")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function bulkUpdateClientStatusAction(
  ids: string[],
  status: "active" | "potential" | "archived"
): Promise<{ error: string } | { success: true; count: number }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }
  if (ids.length === 0) return { error: "Nada seleccionado." }

  const { error, count } = await supabase
    .from("clients")
    .update({ status, updated_at: new Date().toISOString() }, { count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/clients")
  return { success: true, count: count ?? ids.length }
}

export async function bulkDeleteClientsAction(
  ids: string[]
): Promise<{ error: string } | { success: true; count: number }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }
  if (ids.length === 0) return { error: "Nada seleccionado." }

  const { error, count } = await supabase
    .from("clients")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/clients")
  return { success: true, count: count ?? ids.length }
}

export async function deleteClientAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/clients")
  return { success: true }
}
