import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const catalogSchema = z.object({
  project_id: z.string().uuid("Selecciona un proyecto"),
  name:       z.string().min(1, "El nombre es requerido").max(100),
})

export type CatalogFormValues = z.infer<typeof catalogSchema>

export const catalogItemSchema = z.object({
  name:        z.string().min(1, "El nombre es requerido").max(100),
  category:    emptyToUndefined,
  description: emptyToUndefined,
  benefits:    z.string().optional(), // one per line → split on save
  cta:         emptyToUndefined,
  keywords:    z.string().optional(), // comma-separated → split on save
  price:       z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  currency:    z.string().default("USD"),
  image_url:   emptyToUndefined,
  status:      z.enum(["active", "draft"]).default("active"),
  // AI generation context (not saved to DB)
  ai_context:  emptyToUndefined,
})

export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>
