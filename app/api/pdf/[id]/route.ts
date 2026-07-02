import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { createClient } from "@/lib/supabase/server"
import { ReportDocument } from "@/lib/pdf/ReportDocument"
import type { ReportData, ReportAudit, ReportMessages } from "@/lib/pdf/ReportDocument"
import { SECTORS } from "@/constants/navigation"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // ── Fetch report record ──────────────────────────────────────────────────
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!report) return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 })

  // ── Fetch project + client ───────────────────────────────────────────────
  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(*)")
    .eq("id", report.project_id)
    .single()

  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients

  // ── Fetch user profile ───────────────────────────────────────────────────
  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single()

  // ── Fetch latest audit ───────────────────────────────────────────────────
  const sections: string[] = Array.isArray(report.sections) ? report.sections as string[] : []
  const config = (report.config ?? {}) as { consultant_name?: string }
  const consultantName = config.consultant_name || userProfile?.full_name || "Consultor BPO AI"

  let audit: ReportAudit | undefined
  if (sections.includes("diagnosis") || sections.includes("executive_summary") || sections.includes("recommendations")) {
    const { data: latestAudit } = await supabase
      .from("audits")
      .select("*")
      .eq("project_id", report.project_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (latestAudit) {
      const breakdown = (latestAudit.scores_breakdown ?? {}) as Record<string, number>
      audit = {
        total_score:      latestAudit.total_score,
        scores_breakdown: {
          identity:      breakdown.identity      ?? 0,
          information:   breakdown.information   ?? 0,
          catalog:       breakdown.catalog       ?? 0,
          communication: breakdown.communication ?? 0,
        },
        ai_diagnosis:     latestAudit.ai_diagnosis ?? "",
        critical_issues:  (latestAudit.critical_issues ?? []) as ReportAudit["critical_issues"],
        moderate_issues:  (latestAudit.moderate_issues ?? []) as ReportAudit["moderate_issues"],
        minor_issues:     (latestAudit.minor_issues   ?? []) as ReportAudit["minor_issues"],
        positive_aspects: (latestAudit.positive_aspects ?? []) as ReportAudit["positive_aspects"],
        recommendations:  (latestAudit.recommendations  ?? []) as ReportAudit["recommendations"],
      }
    }
  }

  // ── Fetch latest message set ─────────────────────────────────────────────
  let messages: ReportMessages | undefined
  if (sections.includes("messages")) {
    const { data: latestMsg } = await supabase
      .from("generated_content")
      .select("raw_output, tone")
      .eq("project_id", report.project_id)
      .eq("content_type", "message_set")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (latestMsg?.raw_output) {
      try {
        const parsed = JSON.parse(latestMsg.raw_output) as {
          output?: {
            welcome_messages?: ReportMessages["welcome_messages"]
            away_message?:     string
            quick_replies?:    ReportMessages["quick_replies"]
            status_texts?:     ReportMessages["status_texts"]
          }
        }
        const out = parsed.output ?? {}
        messages = {
          tone:             latestMsg.tone ?? "profesional",
          welcome_messages: out.welcome_messages ?? [],
          away_message:     out.away_message ?? "",
          quick_replies:    out.quick_replies ?? [],
          status_texts:     out.status_texts ?? [],
        }
      } catch {
        // skip if corrupt
      }
    }
  }

  // ── Fetch catalog ────────────────────────────────────────────────────────
  let catalog: ReportData["catalog"]
  if (sections.includes("catalog")) {
    const { data: latestCatalog } = await supabase
      .from("catalogs")
      .select("id, name")
      .eq("project_id", report.project_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (latestCatalog) {
      const { data: items } = await supabase
        .from("catalog_items")
        .select("*")
        .eq("catalog_id", latestCatalog.id)
        .eq("status", "active")
        .order("sort_order", { ascending: true })

      catalog = {
        name: latestCatalog.name,
        items: (items ?? []).map((item) => ({
          name:        item.name,
          description: item.description ?? undefined,
          category:    item.category ?? undefined,
          price:       item.price != null ? Number(item.price) : null,
          currency:    item.currency ?? "USD",
          benefits:    Array.isArray(item.benefits) ? (item.benefits as string[]) : [],
          cta:         item.cta ?? undefined,
        })),
      }
    }
  }

  // ── Assemble report data ─────────────────────────────────────────────────
  const sectorLabel = SECTORS.find((s) => s.value === (client as { sector?: string })?.sector)?.label
    ?? (client as { sector?: string })?.sector
    ?? ""

  const reportData: ReportData = {
    project: {
      name:         project.name,
      service_type: project.service_type ?? undefined,
      objective:    project.objective ?? undefined,
    },
    client: {
      business_name:  (client as { business_name: string }).business_name,
      owner_name:     (client as { owner_name?: string }).owner_name ?? undefined,
      sector:         sectorLabel,
      city:           (client as { city?: string }).city ?? undefined,
      whatsapp_phone: (client as { whatsapp_phone?: string }).whatsapp_phone ?? undefined,
      website:        (client as { website?: string }).website ?? undefined,
    },
    consultant_name: consultantName,
    generated_at:    new Date().toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
    }),
    sections,
    audit,
    messages,
    catalog,
  }

  // ── Render PDF ───────────────────────────────────────────────────────────
  let buffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buffer = await renderToBuffer(createElement(ReportDocument, { data: reportData }) as any)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // ── Update report status ─────────────────────────────────────────────────
  await supabase
    .from("reports")
    .update({ status: "generated", generated_at: new Date().toISOString() })
    .eq("id", id)

  const filename = `reporte-${(client as { business_name: string }).business_name.toLowerCase().replace(/\s+/g, "-")}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length":      String(buffer.length),
    },
  })
}
