"use server"

import { createClient } from "@/lib/supabase/server"

export type ImageSource = "pexels" | "freepik"

export interface StockImageResult {
  id:           string | number
  thumb_url:    string
  medium_url:   string
  alt:          string
  photographer: string
  source:       ImageSource
}

export async function searchStockImagesAction(
  query: string,
  source: ImageSource = "pexels",
  page: number = 1
): Promise<{ error: string } | { success: true; images: StockImageResult[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const q = query.trim()
  if (!q) return { error: "Escribe un nombre de producto para buscar." }

  return source === "freepik" ? searchFreepik(q, page) : searchPexels(q, page)
}

async function searchPexels(
  q: string,
  page: number
): Promise<{ error: string } | { success: true; images: StockImageResult[] }> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return { error: "Búsqueda de imágenes no configurada (falta PEXELS_API_KEY)." }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=6&page=${page}&orientation=square`,
      { headers: { Authorization: apiKey }, cache: "no-store" }
    )

    if (!res.ok) return { error: "No se pudo buscar imágenes en Pexels en este momento." }

    const json = await res.json() as {
      photos: Array<{
        id: number
        alt: string
        photographer: string
        src: { medium: string; small: string }
      }>
    }

    if (!json.photos || json.photos.length === 0) {
      return { error: page > 1 ? "No hay más imágenes para esta búsqueda." : "No se encontraron imágenes en Pexels para esa búsqueda." }
    }

    return {
      success: true,
      images: json.photos.map((p) => ({
        id:           p.id,
        thumb_url:    p.src.small,
        medium_url:   p.src.medium,
        alt:          p.alt || q,
        photographer: p.photographer,
        source:       "pexels" as const,
      })),
    }
  } catch {
    return { error: "Error de conexión al buscar imágenes en Pexels." }
  }
}

async function searchFreepik(
  q: string,
  page: number
): Promise<{ error: string } | { success: true; images: StockImageResult[] }> {
  const apiKey = process.env.FREEPIK_API_KEY
  if (!apiKey) return { error: "Búsqueda en Freepik no configurada (falta FREEPIK_API_KEY)." }

  try {
    const res = await fetch(
      `https://api.freepik.com/v1/resources?term=${encodeURIComponent(q)}&limit=6&page=${page}&filters[content_type][photo]=1`,
      { headers: { "x-freepik-api-key": apiKey, "Accept-Language": "es-ES" }, cache: "no-store" }
    )

    if (!res.ok) return { error: "No se pudo buscar imágenes en Freepik en este momento." }

    const json = await res.json() as {
      data: Array<{
        id: number | string
        title?: string
        author?: { name?: string }
        image?: {
          source?: { url?: string }
          preview?: { url?: string }
        }
        thumbnails?: Array<{ url?: string }>
      }>
    }

    if (!json.data || json.data.length === 0) {
      return { error: page > 1 ? "No hay más imágenes para esta búsqueda." : "No se encontraron imágenes en Freepik para esa búsqueda." }
    }

    const images: StockImageResult[] = []
    for (const p of json.data) {
      const url = p.image?.source?.url ?? p.image?.preview?.url ?? p.thumbnails?.[0]?.url
      if (!url) continue
      images.push({
        id:           p.id,
        thumb_url:    url,
        medium_url:   url,
        alt:          p.title || q,
        photographer: p.author?.name || "Freepik",
        source:       "freepik",
      })
    }

    if (images.length === 0) {
      return { error: page > 1 ? "No hay más imágenes para esta búsqueda." : "No se encontraron imágenes en Freepik para esa búsqueda." }
    }

    return { success: true, images }
  } catch {
    return { error: "Error de conexión al buscar imágenes en Freepik." }
  }
}
