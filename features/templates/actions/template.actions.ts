"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTemplateById } from "@/constants/templates-data"

async function getOwnedProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId: string
) {
  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single()
  return project
}

export async function applyTemplateMessagesAction(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const template_id = formData.get("template_id") as string
  const project_id  = formData.get("project_id")  as string

  if (!template_id || !project_id) return { error: "Datos incompletos" }

  const template = getTemplateById(template_id)
  if (!template) return { error: "Plantilla no encontrada" }

  const project = await getOwnedProject(supabase, user.id, project_id)
  if (!project) return { error: "Proyecto no encontrado" }

  // Build output matching MessageSetResult shape — la plantilla guarda welcome_messages
  // como string[], pero el resultado de IA (y el visor) espera { label, text }[]
  const output = {
    welcome_messages: template.messages.welcome_messages.map((text, i) => ({
      label: `Variación ${i + 1}`,
      text,
    })),
    away_message:     template.messages.away_message,
    quick_replies:    template.messages.quick_replies,
    status_texts:     template.messages.status_texts,
  }

  const { data: record, error: insertError } = await supabase
    .from("generated_content")
    .insert({
      user_id:      user.id,
      project_id,
      client_id:    project.client_id,
      content_type: "message_set",
      tone:         "profesional",
      raw_output: JSON.stringify({
        input: {
          source:        "template",
          template_id:   template.id,
          template_name: template.name,
        },
        output,
      }),
    })
    .select("id")
    .single()

  if (insertError || !record) return { error: insertError?.message ?? "Error al guardar los mensajes" }

  revalidatePath("/messages")
  redirect(`/messages/${record.id}`)
}

export async function applyTemplateProfileAction(
  templateId: string,
  projectId: string
): Promise<{ error: string } | { success: true; contentId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const template = getTemplateById(templateId)
  if (!template) return { error: "Plantilla no encontrada" }

  const project = await getOwnedProject(supabase, user.id, projectId)
  if (!project) return { error: "Proyecto no encontrado" }

  // Build output matching ProfileContentResult shape
  const output = {
    business_names: [
      { name: template.profile.example_name, strategy: "descriptivo", rationale: "Nombre de ejemplo de la plantilla de sector — edítalo con el nombre real del negocio." },
    ],
    short_description: template.profile.short_description,
    long_description:  template.profile.long_description,
    keywords:           template.profile.keywords,
    strategy_note:       template.strategy,
  }

  const { data: record, error: insertError } = await supabase
    .from("generated_content")
    .insert({
      user_id:      user.id,
      project_id:   projectId,
      client_id:    project.client_id,
      content_type: "profile_content",
      tone:         "profesional",
      raw_output: JSON.stringify({
        format: "profile",
        input: {
          source:        "template",
          template_id:   template.id,
          template_name: template.name,
        },
        output,
      }),
    })
    .select("id")
    .single()

  if (insertError || !record) return { error: insertError?.message ?? "Error al guardar el contenido" }

  revalidatePath("/content")
  return { success: true, contentId: record.id }
}

export async function applyTemplateCatalogAction(
  templateId: string,
  projectId: string
): Promise<{ error: string } | { success: true; catalogId: string; count: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const template = getTemplateById(templateId)
  if (!template) return { error: "Plantilla no encontrada" }
  if (template.catalog_items.length === 0) return { error: "Esta plantilla no tiene productos base" }

  const project = await getOwnedProject(supabase, user.id, projectId)
  if (!project) return { error: "Proyecto no encontrado" }

  const { data: catalog, error: catalogError } = await supabase
    .from("catalogs")
    .insert({
      user_id:    user.id,
      project_id: projectId,
      client_id:  project.client_id,
      name:       `Catálogo — ${template.name}`,
    })
    .select("id")
    .single()

  if (catalogError || !catalog) return { error: catalogError?.message ?? "Error al crear el catálogo" }

  const rows = template.catalog_items.map((item, i) => ({
    catalog_id:      catalog.id,
    user_id:         user.id,
    name:            item.name,
    category:        item.category ?? null,
    description:     item.description,
    benefits:        JSON.stringify([]),
    keywords:        JSON.stringify([]),
    price:           item.price ?? null,
    currency:        "USD",
    cta:             item.cta ?? null,
    status:          "active" as const,
    is_ai_generated: false,
    sort_order:      i,
  }))

  const { error: itemsError } = await supabase.from("catalog_items").insert(rows)
  if (itemsError) return { error: itemsError.message }

  revalidatePath("/catalog")
  revalidatePath(`/projects/${projectId}`)
  return { success: true, catalogId: catalog.id, count: rows.length }
}
