import Anthropic from "@anthropic-ai/sdk"
import { MESSAGES_SYSTEM_PROMPT, buildMessagesUserMessage, type MessageInput } from "./prompts/messages.prompt"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface WelcomeMessage {
  label: string
  text: string
}

export interface QuickReply {
  title: string
  message: string
}

export interface StatusText {
  type: string
  text: string
}

export interface MessageSetResult {
  welcome_messages: WelcomeMessage[]
  away_message: string
  quick_replies: QuickReply[]
  status_texts: StatusText[]
}

export async function generateMessageSet(input: MessageInput): Promise<MessageSetResult> {
  const userMessage = buildMessagesUserMessage(input)

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: MESSAGES_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
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

  return validateMessageSet(parsed)
}

function validateMessageSet(data: unknown): MessageSetResult {
  if (typeof data !== "object" || data === null) {
    throw new Error("Respuesta inválida: no es un objeto")
  }
  const d = data as Record<string, unknown>

  const welcome_messages: WelcomeMessage[] = Array.isArray(d.welcome_messages)
    ? d.welcome_messages.map((m: unknown) => {
        const item = m as Record<string, unknown>
        return { label: String(item.label ?? ""), text: String(item.text ?? "") }
      })
    : []

  const quick_replies: QuickReply[] = Array.isArray(d.quick_replies)
    ? d.quick_replies.map((r: unknown) => {
        const item = r as Record<string, unknown>
        return { title: String(item.title ?? ""), message: String(item.message ?? "") }
      })
    : []

  const status_texts: StatusText[] = Array.isArray(d.status_texts)
    ? d.status_texts.map((s: unknown) => {
        const item = s as Record<string, unknown>
        return { type: String(item.type ?? ""), text: String(item.text ?? "") }
      })
    : []

  return {
    welcome_messages,
    away_message: String(d.away_message ?? ""),
    quick_replies,
    status_texts,
  }
}
