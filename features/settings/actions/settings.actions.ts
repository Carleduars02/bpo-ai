"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const profileSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio").max(100),
  company:   z.string().max(100).optional(),
})

type ProfileActionState = { error: string } | { success: true } | null

export async function updateProfileAction(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    company:   formData.get("company") || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  const { error } = await supabase
    .from("users")
    .update({
      full_name:  parsed.data.full_name,
      company:    parsed.data.company ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { error: "Error al guardar los cambios" }

  revalidatePath("/settings")
  return { success: true }
}
