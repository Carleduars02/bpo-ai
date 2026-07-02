"use server"

import { createClient } from "@/lib/supabase/server"
import { catalogSchema, catalogItemSchema, type CatalogFormValues, type CatalogItemFormValues } from "../schemas/catalog.schema"
import { generateCatalogItemContent } from "@/lib/ai/catalog-item"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ── Catalogs ─────────────────────────────────────────────────────────────────

export async function createCatalogAction(
  data: CatalogFormValues
): Promise<{ error: string } | { success: true; catalogId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = catalogSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos." }

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", validated.data.project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  const { data: created, error } = await supabase
    .from("catalogs")
    .insert({
      user_id:    user.id,
      project_id: project.id,
      client_id:  project.client_id,
      name:       validated.data.name,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/catalog")
  revalidatePath(`/projects/${project.id}`)
  return { success: true, catalogId: created.id }
}

export async function deleteCatalogAction(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("catalogs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/catalog")
  return { success: true }
}

// ── Catalog Items ─────────────────────────────────────────────────────────────

export async function generateCatalogItemContentAction(
  name: string,
  context: string,
  category: string
): Promise<{ error: string } | { description: string; benefits: string[]; cta: string; keywords: string[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  if (!name.trim()) return { error: "El nombre del producto es requerido." }

  try {
    const result = await generateCatalogItemContent(name.trim(), context, category)
    return result
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { error: `Error al generar con IA: ${msg}` }
  }
}

export async function createCatalogItemAction(
  catalogId: string,
  data: CatalogItemFormValues
): Promise<{ error: string } | { success: true; itemId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = catalogItemSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id")
    .eq("id", catalogId)
    .eq("user_id", user.id)
    .single()

  if (!catalog) return { error: "Catálogo no encontrado." }

  const benefits = validated.data.benefits
    ? validated.data.benefits.split("\n").map((s) => s.trim()).filter(Boolean)
    : []

  const keywords = validated.data.keywords
    ? validated.data.keywords.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { data: created, error } = await supabase
    .from("catalog_items")
    .insert({
      catalog_id:      catalogId,
      user_id:         user.id,
      name:            validated.data.name,
      category:        validated.data.category,
      description:     validated.data.description,
      benefits:        JSON.stringify(benefits),
      cta:             validated.data.cta,
      keywords:        JSON.stringify(keywords),
      price:           validated.data.price,
      currency:        validated.data.currency,
      image_url:       validated.data.image_url,
      status:          validated.data.status,
      is_ai_generated: false,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/catalog/${catalogId}`)
  return { success: true, itemId: created.id }
}

export async function updateCatalogItemAction(
  itemId: string,
  catalogId: string,
  data: CatalogItemFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validated = catalogItemSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos." }

  const benefits = validated.data.benefits
    ? validated.data.benefits.split("\n").map((s) => s.trim()).filter(Boolean)
    : []

  const keywords = validated.data.keywords
    ? validated.data.keywords.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from("catalog_items")
    .update({
      name:        validated.data.name,
      category:    validated.data.category,
      description: validated.data.description,
      benefits:    JSON.stringify(benefits),
      cta:         validated.data.cta,
      keywords:    JSON.stringify(keywords),
      price:       validated.data.price,
      currency:    validated.data.currency,
      image_url:   validated.data.image_url,
      status:      validated.data.status,
      updated_at:  new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/catalog/${catalogId}`)
  return { success: true }
}

export async function deleteCatalogItemAction(
  itemId: string,
  catalogId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("catalog_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/catalog/${catalogId}`)
  return { success: true }
}
