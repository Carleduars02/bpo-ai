"use server"

import { createClient } from "@/lib/supabase/server"
import { generateCatalogItemContent } from "@/lib/ai/catalog-item"
import { revalidatePath } from "next/cache"

export interface BulkItemInput {
  name:        string
  category?:   string
  price?:      number
  currency:    string
  description?: string
}

export interface BulkItemSaved extends BulkItemInput {
  id:          string
  description: string
  benefits:    string[]
  keywords:    string[]
  cta:         string
}

export async function bulkCreateCatalogItemsAction(
  catalogId: string,
  items: BulkItemInput[]
): Promise<{ error: string } | { success: true; count: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id")
    .eq("id", catalogId)
    .eq("user_id", user.id)
    .single()

  if (!catalog) return { error: "Catálogo no encontrado." }

  const rows = items
    .filter((i) => i.name.trim())
    .map((item) => ({
      catalog_id:      catalogId,
      user_id:         user.id,
      name:            item.name.trim(),
      category:        item.category?.trim() || null,
      description:     item.description?.trim() || null,
      benefits:        JSON.stringify([]),
      keywords:        JSON.stringify([]),
      price:           item.price ?? null,
      currency:        item.currency || "USD",
      status:          "active" as const,
      is_ai_generated: false,
    }))

  if (rows.length === 0) return { error: "No hay productos válidos para importar." }

  const { error } = await supabase.from("catalog_items").insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/catalog/${catalogId}`)
  return { success: true, count: rows.length }
}

export async function generateBulkItemContentAction(
  name: string,
  category: string,
  context: string
): Promise<{ error: string } | { description: string; benefits: string[]; cta: string; keywords: string[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  try {
    const result = await generateCatalogItemContent(name, context, category)
    return result
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { error: msg }
  }
}

// ── Export for WhatsApp (Meta Commerce CSV format) ────────────────────────────

export interface CatalogItemForExport {
  id:          string
  name:        string
  description: string | null
  price:       number | null
  currency:    string | null
  category:    string | null
  image_url:   string | null
  status:      string
}

export async function exportCatalogToWhatsAppCSVAction(
  catalogId: string
): Promise<{ error: string } | { success: true; csv: string; filename: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("name, clients(business_name)")
    .eq("id", catalogId)
    .eq("user_id", user.id)
    .single()

  if (!catalog) return { error: "Catálogo no encontrado." }

  const { data: items } = await supabase
    .from("catalog_items")
    .select("id, name, description, price, currency, category, image_url, status")
    .eq("catalog_id", catalogId)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })

  if (!items || items.length === 0) return { error: "El catálogo no tiene productos." }

  // Meta Commerce CSV format required columns
  const headers = ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand", "google_product_category"]

  const escapeCSV = (v: string) => `"${v.replace(/"/g, '""')}"`

  const rows = items.map((item) => {
    const price = item.price != null
      ? `${Number(item.price).toFixed(2)} ${(item.currency ?? "USD").toUpperCase()}`
      : "0.00 USD"
    const availability = item.status === "active" ? "in stock" : "out of stock"
    const description  = item.description ?? item.name

    return [
      escapeCSV(item.id),
      escapeCSV(item.name),
      escapeCSV(description),
      availability,
      "new",
      escapeCSV(price),
      "https://wa.me",
      escapeCSV(item.image_url ?? ""),
      "",
      escapeCSV(item.category ?? ""),
    ].join(",")
  })

  const csv      = [headers.join(","), ...rows].join("\n")
  const client   = Array.isArray(catalog.clients) ? catalog.clients[0] : catalog.clients
  const bizName  = (client as { business_name: string } | null)?.business_name ?? "catalogo"
  const filename = `${bizName.toLowerCase().replace(/\s+/g, "-")}-whatsapp.csv`

  return { success: true, csv, filename }
}
