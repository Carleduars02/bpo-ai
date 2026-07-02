import { z } from "zod"

const emptyToUndefined = z.string().optional().transform((v) => v === "" ? undefined : v)

export const messageSetSchema = z.object({
  project_id:         z.string().uuid("Selecciona un proyecto"),
  tone:               z.string().min(1, "Selecciona un tono"),
  schedule:           emptyToUndefined,
  services:           emptyToUndefined,
  additional_context: emptyToUndefined,
})

export type MessageSetFormValues = z.infer<typeof messageSetSchema>

export const TONE_OPTIONS = [
  { value: "profesional",   label: "Profesional",             description: "Serio, confiable y directo" },
  { value: "cercano",       label: "Cercano y amigable",       description: "Cálido, como hablarle a un conocido" },
  { value: "formal",        label: "Formal y corporativo",     description: "Institucional, para empresas establecidas" },
  { value: "aspiracional",  label: "Aspiracional y premium",   description: "Exclusivo, para marcas de alto valor" },
  { value: "divertido",     label: "Divertido y creativo",     description: "Desenfadado, con personalidad propia" },
] as const
