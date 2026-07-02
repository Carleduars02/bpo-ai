import { z } from "zod"

export const TONE_OPTIONS = [
  { value: "profesional", label: "Profesional",   description: "Serio, confiable, corporativo" },
  { value: "cercano",     label: "Cercano",        description: "Amigable, cálido, accesible" },
  { value: "formal",      label: "Formal",         description: "Riguroso, técnico, institucional" },
  { value: "aspiracional",label: "Aspiracional",   description: "Inspirador, premium, de lujo" },
  { value: "divertido",   label: "Divertido",      description: "Dinámico, creativo, juvenil" },
] as const

export const CONTENT_FORMAT_OPTIONS = [
  {
    value:       "profile",
    label:       "Perfil",
    description: "Nombre comercial, descripciones y palabras clave del perfil de WhatsApp Business",
  },
  {
    value:       "status",
    label:       "Post para Estado",
    description: "Contenido corto y visual para compartir en los estados de WhatsApp",
  },
  {
    value:       "promo",
    label:       "Promoción",
    description: "Anuncio de oferta o descuento listo para enviar a clientes",
  },
  {
    value:       "seasonal",
    label:       "Fecha especial",
    description: "Contenido para una festividad o temporada (Navidad, Día de la Madre, etc.)",
  },
] as const

export type ContentFormat = typeof CONTENT_FORMAT_OPTIONS[number]["value"]

export const contentSchema = z.object({
  project_id:         z.string().uuid("Selecciona un proyecto"),
  format:             z.enum(["profile", "status", "promo", "seasonal"]).default("profile"),
  tone:               z.string().min(1, "Selecciona un tono"),
  target_audience:    z.string().max(200).optional(),
  unique_value:       z.string().max(300).optional(),
  additional_context: z.string().max(500).optional(),
  promo_offer:        z.string().max(200).optional(),
  seasonal_occasion:  z.string().max(100).optional(),
}).superRefine((data, ctx) => {
  if (data.format === "promo" && !data.promo_offer?.trim()) {
    ctx.addIssue({ code: "custom", path: ["promo_offer"], message: "Describe la oferta o promoción" })
  }
  if (data.format === "seasonal" && !data.seasonal_occasion?.trim()) {
    ctx.addIssue({ code: "custom", path: ["seasonal_occasion"], message: "Indica la fecha o festividad" })
  }
})

export type ContentFormValues = z.infer<typeof contentSchema>
