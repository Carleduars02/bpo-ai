"use server"

import { createClient } from "@/lib/supabase/server"
import { extractProfileFromImage, type ExtractedProfile } from "@/lib/ai/extract-profile"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function extractProfileFromScreenshotAction(
  imageBase64: string,
  mimeType: string
): Promise<{ error: string } | { success: true; data: ExtractedProfile }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  if (!ALLOWED_MIME.has(mimeType)) {
    return { error: "Formato de imagen no admitido. Usa JPG, PNG, WEBP o GIF." }
  }
  if (Buffer.byteLength(imageBase64, "base64") > MAX_IMAGE_BYTES) {
    return { error: "La imagen no puede superar 5 MB." }
  }

  try {
    const data = await extractProfileFromImage(imageBase64, mimeType)
    return { success: true, data }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { error: `Error al analizar la captura: ${msg}` }
  }
}

interface ClientLookupResult {
  business_name?:  string
  description?:    string
  category?:       string
  has_website?:    boolean
  whatsapp_link?:  string
}

export async function lookupClientFromLinkAction(
  link: string
): Promise<{ error: string } | { success: true; data: ClientLookupResult }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const phoneMatch = link.match(/(?:wa\.me\/|phone=)\+?(\d{8,15})/)
  if (!phoneMatch) {
    return { error: "No se pudo identificar un número de teléfono en el enlace." }
  }
  const phone = phoneMatch[1]

  const { data: client } = await supabase
    .from("clients")
    .select("business_name, sector, description, website, whatsapp_link, whatsapp_phone")
    .eq("user_id", user.id)
    .ilike("whatsapp_phone", `%${phone.slice(-8)}%`)
    .maybeSingle()

  if (!client) {
    return { error: "No encontramos ningún cliente registrado con ese número. Verifica el enlace o usa la captura de pantalla." }
  }

  return {
    success: true,
    data: {
      business_name: client.business_name ?? undefined,
      description:   client.description ?? undefined,
      category:      client.sector ?? undefined,
      has_website:   Boolean(client.website),
      whatsapp_link: client.whatsapp_link ?? undefined,
    },
  }
}
