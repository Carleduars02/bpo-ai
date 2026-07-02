import Anthropic from "@anthropic-ai/sdk"
import {
  CONTENT_SYSTEM_PROMPT,
  STATUS_SYSTEM_PROMPT,
  PROMO_SYSTEM_PROMPT,
  SEASONAL_SYSTEM_PROMPT,
  buildContentUserMessage,
} from "./prompts/content.prompt"
import type { ContentInput } from "./prompts/content.prompt"

const client = new Anthropic()

export interface BusinessName {
  name:      string
  strategy:  string
  rationale: string
}

export interface ProfileContentResult {
  business_names:    BusinessName[]
  short_description: string
  long_description:  string
  keywords:          string[]
  strategy_note:     string
}

export interface StatusPost {
  text:             string
  suggested_visual: string
  angle:            string
}

export interface StatusPostsResult {
  posts:         StatusPost[]
  strategy_note: string
}

export interface AnnouncementResult {
  headline:      string
  body:          string
  cta:           string
  terms_note:    string
  strategy_note: string
}

async function callClaude(system: string, userMessage: string, maxTokens: number): Promise<Record<string, unknown>> {
  const message = await client.messages.create({
    model:      "claude-sonnet-5",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  })

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("La IA no devolvió JSON válido")

  return JSON.parse(jsonMatch[0]) as Record<string, unknown>
}

export async function generateProfileContent(input: ContentInput): Promise<ProfileContentResult> {
  const parsed = await callClaude(CONTENT_SYSTEM_PROMPT, buildContentUserMessage(input), 1500) as unknown as ProfileContentResult

  if (
    !Array.isArray(parsed.business_names) ||
    typeof parsed.short_description !== "string" ||
    typeof parsed.long_description !== "string" ||
    !Array.isArray(parsed.keywords)
  ) {
    throw new Error("La respuesta de la IA tiene un formato inesperado")
  }

  return parsed
}

export async function generateStatusPosts(input: ContentInput): Promise<StatusPostsResult> {
  const parsed = await callClaude(STATUS_SYSTEM_PROMPT, buildContentUserMessage(input), 1200) as unknown as StatusPostsResult

  if (!Array.isArray(parsed.posts) || parsed.posts.length === 0) {
    throw new Error("La respuesta de la IA tiene un formato inesperado")
  }

  return parsed
}

export async function generateAnnouncement(
  input: ContentInput,
  kind: "promo" | "seasonal"
): Promise<AnnouncementResult> {
  const system = kind === "promo" ? PROMO_SYSTEM_PROMPT : SEASONAL_SYSTEM_PROMPT
  const parsed = await callClaude(system, buildContentUserMessage(input), 800) as unknown as AnnouncementResult

  if (typeof parsed.headline !== "string" || typeof parsed.body !== "string") {
    throw new Error("La respuesta de la IA tiene un formato inesperado")
  }

  return parsed
}
