import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const EVENT_TYPES = [
  { value: "delivery",  label: "Entrega / Vencimiento" },
  { value: "meeting",   label: "Reunión / Llamada" },
  { value: "followup",  label: "Seguimiento" },
  { value: "note",      label: "Nota importante" },
  { value: "other",     label: "Otro" },
] as const

export const RECURRENCE_OPTIONS = [
  { value: "none",    label: "No se repite" },
  { value: "weekly",  label: "Cada semana" },
  { value: "monthly", label: "Cada mes" },
] as const

export const calendarEventSchema = z.object({
  project_id:     z.string().uuid("Selecciona un cliente/proyecto"),
  title:          z.string().min(1, "El título es requerido").max(120),
  event_type:     z.enum(["delivery", "meeting", "followup", "note", "other"]).default("delivery"),
  notes:          emptyToUndefined,
  scheduled_date: z.string().min(1, "Selecciona una fecha"),
  recurrence:     z.enum(["none", "weekly", "monthly"]).default("none"),
  repeat_count:   z.coerce.number().int().min(1).max(52).default(1),
})

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>
