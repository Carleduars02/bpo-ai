import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExtractedProfile {
  business_name?:  string
  description?:    string
  category?:       string
  has_schedule?:   boolean
  has_location?:   boolean
  has_website?:    boolean
  website_url?:    string
  notes?:          string
}

const EXTRACT_SYSTEM_PROMPT = `Eres un asistente que analiza capturas de pantalla de la pantalla "Info" o "Datos de la empresa" de un perfil de WhatsApp Business y extrae los datos visibles.

Devuelve SOLO un objeto JSON (sin markdown, sin explicación) con esta estructura exacta:
{
  "business_name": "nombre del negocio tal como aparece, o null si no es visible",
  "description": "texto de la descripción del perfil, o null",
  "category": "categoría del negocio configurada, o null",
  "has_schedule": true/false (true solo si se ve un horario de atención configurado),
  "has_location": true/false (true solo si se ve una dirección o ubicación configurada),
  "has_website": true/false (true solo si se ve un sitio web vinculado),
  "website_url": "URL del sitio web si es visible, o null",
  "notes": "breve nota en español sobre qué se pudo o no se pudo identificar en la imagen"
}

Reglas:
- Si la imagen no parece ser un perfil de WhatsApp Business, deja los campos en null/false y explica en "notes".
- No inventes datos que no estén visibles en la captura.
- Responde únicamente con el JSON.`

export async function extractProfileFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedProfile> {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: EXTRACT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Analiza esta captura de pantalla del perfil de WhatsApp Business y extrae los datos visibles según el formato indicado.",
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude no devolvió texto en la respuesta")
  }

  const raw = textBlock.text.trim()
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonString = jsonMatch ? jsonMatch[1] : raw

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error("La respuesta de Claude no es JSON válido")
  }

  const d = parsed as Record<string, unknown>
  return {
    business_name: typeof d.business_name === "string" ? d.business_name : undefined,
    description:   typeof d.description === "string" ? d.description : undefined,
    category:      typeof d.category === "string" ? d.category : undefined,
    has_schedule:  typeof d.has_schedule === "boolean" ? d.has_schedule : undefined,
    has_location:  typeof d.has_location === "boolean" ? d.has_location : undefined,
    has_website:   typeof d.has_website === "boolean" ? d.has_website : undefined,
    website_url:   typeof d.website_url === "string" ? d.website_url : undefined,
    notes:         typeof d.notes === "string" ? d.notes : undefined,
  }
}
