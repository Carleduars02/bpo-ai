import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const projectSchema = z.object({
  client_id:       z.string().uuid("Selecciona un cliente"),
  name:            z.string().min(2, "El nombre del proyecto es requerido"),
  service_type:    emptyToUndefined,
  objective:       emptyToUndefined,
  notes:           emptyToUndefined,
  status:          z.enum(["pending", "in_progress", "review", "completed", "archived"]),
  initial_score:   z.coerce.number().int().min(0).max(100).optional().or(z.literal("").transform(() => undefined)),
  projected_score: z.coerce.number().int().min(0).max(100).optional().or(z.literal("").transform(() => undefined)),
  delivery_date:   emptyToUndefined,
})

export type ProjectFormValues = z.infer<typeof projectSchema>
