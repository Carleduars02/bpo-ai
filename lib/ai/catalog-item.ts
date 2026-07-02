import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en marketing digital para WhatsApp Business. Tu tarea es generar contenido optimizado para fichas de productos/servicios del catálogo de WhatsApp Business.

El contenido debe ser:
- Conciso y persuasivo (optimizado para móvil y WhatsApp)
- En español, tono profesional pero cercano
- Orientado a la conversión (que el cliente quiera preguntar o comprar)

Responde ÚNICAMENTE con JSON válido sin texto adicional:

{
  "description": "<descripción del producto/servicio, máximo 500 caracteres, enfocada en el beneficio principal>",
  "benefits": ["<beneficio 1>", "<beneficio 2>", "<beneficio 3>"],
  "cta": "<frase corta de llamada a la acción, máximo 60 caracteres, ej: 'Escríbenos para pedido'>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"]
}`

export interface CatalogItemContent {
  description: string
  benefits: string[]
  cta: string
  keywords: string[]
}

export async function generateCatalogItemContent(
  name: string,
  context: string,
  category: string
): Promise<CatalogItemContent> {
  const userMessage = [
    `Producto/servicio: ${name}`,
    category ? `Categoría: ${category}` : null,
    context ? `Contexto adicional: ${context}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de texto")
  }

  const raw = textBlock.text.trim()
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonString = jsonMatch ? jsonMatch[1] : raw

  const parsed = JSON.parse(jsonString) as {
    description?: unknown
    benefits?: unknown
    cta?: unknown
    keywords?: unknown
  }

  return {
    description: String(parsed.description ?? ""),
    benefits:    Array.isArray(parsed.benefits) ? parsed.benefits.map(String) : [],
    cta:         String(parsed.cta ?? ""),
    keywords:    Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
  }
}
