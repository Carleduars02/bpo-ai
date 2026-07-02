import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const clientSchema = z.object({
  business_name: z.string().min(2, "El nombre del negocio es requerido"),
  owner_name: emptyToUndefined,
  sector: z.string().min(1, "Selecciona un sector"),
  description: emptyToUndefined,
  city: emptyToUndefined,
  website: emptyToUndefined.refine(
    (v) => !v || /^https?:\/\/.+/.test(v),
    "Ingresa una URL válida (https://...)"
  ),
  whatsapp_phone: emptyToUndefined,
  email: emptyToUndefined.refine(
    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email inválido"
  ),
  whatsapp_link: emptyToUndefined,
  status: z.enum(["active", "potential", "archived"]),
  source: emptyToUndefined,
  price: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  notes: emptyToUndefined,
  next_followup: emptyToUndefined,
})

export type ClientFormValues = z.infer<typeof clientSchema>
