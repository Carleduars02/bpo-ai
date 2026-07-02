import Anthropic from "@anthropic-ai/sdk"
import { AUDIT_SYSTEM_PROMPT, buildAuditUserMessage } from "./prompts/audit.prompt"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AuditIssue {
  title: string
  description: string
  area: "identity" | "information" | "catalog" | "communication"
}

export interface AuditPositive {
  title: string
  description: string
}

export interface AuditRecommendation {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  area: "identity" | "information" | "catalog" | "communication"
  // Seguimiento del consultor: se marca al implementarla (persistido en el JSONB audits.recommendations)
  done?: boolean
}

export interface AuditResult {
  total_score: number
  scores_breakdown: {
    identity: number
    information: number
    catalog: number
    communication: number
  }
  ai_diagnosis: string
  critical_issues: AuditIssue[]
  moderate_issues: AuditIssue[]
  minor_issues: AuditIssue[]
  positive_aspects: AuditPositive[]
  recommendations: AuditRecommendation[]
}

export interface AuditInput {
  profile_photo_url?: string | null
  business_name_input?: string | null
  description_input?: string | null
  category_input?: string | null
  has_schedule: boolean
  has_location: boolean
  has_website: boolean
  has_catalog: boolean
  catalog_product_count: number
  catalog_quality?: number | null
  has_welcome_message: boolean
  has_away_message: boolean
  quick_replies_count: number
  posts_status: boolean
  status_frequency?: string | null
  uses_labels: boolean
  additional_notes?: string | null
}

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  const userMessage = buildAuditUserMessage(input)

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: AUDIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude no devolvió texto en la respuesta")
  }

  const raw = textBlock.text.trim()

  // Extract JSON if wrapped in markdown code blocks
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonString = jsonMatch ? jsonMatch[1] : raw

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error("La respuesta de Claude no es JSON válido")
  }

  return validateAuditResult(parsed)
}

function validateAuditResult(data: unknown): AuditResult {
  if (typeof data !== "object" || data === null) {
    throw new Error("Respuesta inválida: no es un objeto")
  }

  const d = data as Record<string, unknown>

  const total_score = Number(d.total_score ?? 0)
  const breakdown = (d.scores_breakdown ?? {}) as Record<string, unknown>

  return {
    total_score: Math.min(100, Math.max(0, total_score)),
    scores_breakdown: {
      identity:      Math.min(25, Math.max(0, Number(breakdown.identity ?? 0))),
      information:   Math.min(25, Math.max(0, Number(breakdown.information ?? 0))),
      catalog:       Math.min(25, Math.max(0, Number(breakdown.catalog ?? 0))),
      communication: Math.min(25, Math.max(0, Number(breakdown.communication ?? 0))),
    },
    ai_diagnosis:    String(d.ai_diagnosis ?? ""),
    critical_issues: parseIssues(d.critical_issues),
    moderate_issues: parseIssues(d.moderate_issues),
    minor_issues:    parseIssues(d.minor_issues),
    positive_aspects: parsePositives(d.positive_aspects),
    recommendations:  parseRecommendations(d.recommendations),
  }
}

function parseIssues(raw: unknown): AuditIssue[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const i = item as Record<string, unknown>
    return {
      title:       String(i.title ?? ""),
      description: String(i.description ?? ""),
      area:        (["identity","information","catalog","communication"].includes(String(i.area))
        ? i.area : "identity") as AuditIssue["area"],
    }
  })
}

function parsePositives(raw: unknown): AuditPositive[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const i = item as Record<string, unknown>
    return { title: String(i.title ?? ""), description: String(i.description ?? "") }
  })
}

function parseRecommendations(raw: unknown): AuditRecommendation[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const i = item as Record<string, unknown>
    return {
      title:       String(i.title ?? ""),
      description: String(i.description ?? ""),
      priority:    (["high","medium","low"].includes(String(i.priority)) ? i.priority : "medium") as AuditRecommendation["priority"],
      area:        (["identity","information","catalog","communication"].includes(String(i.area))
        ? i.area : "identity") as AuditRecommendation["area"],
    }
  })
}
