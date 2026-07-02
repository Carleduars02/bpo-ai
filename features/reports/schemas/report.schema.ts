import { z } from "zod"

export const reportSchema = z.object({
  project_id:      z.string().uuid("Selecciona un proyecto"),
  title:           z.string().min(1, "El título es requerido"),
  consultant_name: z.string().optional(),
  sections: z
    .array(z.enum(["executive_summary", "diagnosis", "recommendations", "messages", "catalog"]))
    .min(1, "Selecciona al menos una sección"),
})

export type ReportFormValues = z.infer<typeof reportSchema>

export const SECTION_OPTIONS = [
  {
    value:       "executive_summary",
    label:       "Resumen ejecutivo",
    description: "Score general, hallazgos críticos y puntos positivos",
    requires:    "auditoría",
  },
  {
    value:       "diagnosis",
    label:       "Diagnóstico completo",
    description: "Análisis detallado por dimensión, todos los problemas encontrados",
    requires:    "auditoría",
  },
  {
    value:       "recommendations",
    label:       "Plan de acción",
    description: "Recomendaciones priorizadas con pasos concretos y áreas de impacto",
    requires:    "auditoría",
  },
  {
    value:       "messages",
    label:       "Mensajes optimizados",
    description: "Bienvenida, ausencia, respuestas rápidas y estados generados por IA",
    requires:    "set de mensajes",
  },
  {
    value:       "catalog",
    label:       "Catálogo de productos",
    description: "Productos y servicios con descripciones optimizadas para WhatsApp",
    requires:    "catálogo",
  },
] as const
