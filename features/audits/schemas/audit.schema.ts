import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const auditSchema = z.object({
  project_id:           z.string().uuid("Selecciona un proyecto"),
  profile_photo_url:    emptyToUndefined,
  business_name_input:  emptyToUndefined,
  description_input:    emptyToUndefined,
  category_input:       emptyToUndefined,
  has_schedule:         z.boolean().default(false),
  has_location:         z.boolean().default(false),
  has_website:          z.boolean().default(false),
  has_catalog:          z.boolean().default(false),
  catalog_product_count: z.coerce.number().int().min(0).default(0),
  catalog_quality:      z.coerce.number().int().min(1).max(5).optional().or(z.literal("").transform(() => undefined)),
  has_welcome_message:  z.boolean().default(false),
  has_away_message:     z.boolean().default(false),
  quick_replies_count:  z.coerce.number().int().min(0).default(0),
  posts_status:         z.boolean().default(false),
  status_frequency:     emptyToUndefined,
  uses_labels:          z.boolean().default(false),
  additional_notes:     emptyToUndefined,
})

export type AuditFormValues = z.infer<typeof auditSchema>
