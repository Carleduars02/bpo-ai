import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportAudit {
  total_score:      number
  scores_breakdown: { identity: number; information: number; catalog: number; communication: number }
  ai_diagnosis:     string
  critical_issues:  Array<{ title: string; description: string; area: string }>
  moderate_issues:  Array<{ title: string; description: string; area: string }>
  minor_issues:     Array<{ title: string; description: string; area: string }>
  positive_aspects: Array<{ title: string; description: string }>
  recommendations:  Array<{ title: string; description: string; priority: string; area: string }>
}

export interface ReportMessages {
  tone:             string
  welcome_messages: Array<{ label: string; text: string }>
  away_message:     string
  quick_replies:    Array<{ title: string; message: string }>
  status_texts:     Array<{ type: string; text: string }>
}

export interface ReportCatalogItem {
  name:        string
  description?: string
  category?:   string
  price?:      number | null
  currency:    string
  benefits:    string[]
  cta?:        string
}

export interface ReportData {
  project: {
    name:           string
    service_type?:  string
    objective?:     string
  }
  client: {
    business_name: string
    owner_name?:   string
    sector:        string
    city?:         string
    whatsapp_phone?: string
    website?:      string
  }
  consultant_name: string
  generated_at:    string
  sections:        string[]
  audit?:          ReportAudit
  messages?:       ReportMessages
  catalog?: {
    name:  string
    items: ReportCatalogItem[]
  }
}

// ── Palette ───────────────────────────────────────────────────────────────────

const P = {
  navy:      "#0f172a",
  blue:      "#1d4ed8",
  blueLight: "#dbeafe",
  slate:     "#475569",
  muted:     "#94a3b8",
  border:    "#e2e8f0",
  bg:        "#f8fafc",
  white:     "#ffffff",
  green:     "#16a34a",
  greenBg:   "#dcfce7",
  yellow:    "#d97706",
  yellowBg:  "#fef9c3",
  red:       "#dc2626",
  redBg:     "#fee2e2",
  orange:    "#ea580c",
} as const

function scoreColor(score: number, max: number = 100): string {
  const pct = score / max
  if (pct >= 0.8) return P.green
  if (pct >= 0.6) return P.yellow
  return P.red
}

function priorityColor(priority: string): string {
  if (priority === "high")   return P.red
  if (priority === "medium") return P.yellow
  return P.blue
}

const AREA_LABELS: Record<string, string> = {
  identity:      "Identidad",
  information:   "Información",
  catalog:       "Catálogo",
  communication: "Comunicación",
}

const TONE_LABELS: Record<string, string> = {
  profesional:  "Profesional",
  cercano:      "Cercano y amigable",
  formal:       "Formal y corporativo",
  aspiracional: "Aspiracional y premium",
  divertido:    "Divertido y creativo",
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Pages
  coverPage: { backgroundColor: P.navy, padding: 0 },
  page:      { backgroundColor: P.white, paddingHorizontal: 44, paddingVertical: 36, fontFamily: "Helvetica", fontSize: 9, color: P.navy },

  // Cover elements
  coverTop:    { backgroundColor: P.blue, paddingHorizontal: 44, paddingTop: 44, paddingBottom: 32 },
  coverLabel:  { fontSize: 8, color: "#93c5fd", letterSpacing: 2, marginBottom: 8, fontFamily: "Helvetica" },
  coverTitle:  { fontSize: 22, color: P.white, fontFamily: "Helvetica-Bold", lineHeight: 1.3, marginBottom: 4 },
  coverSub:    { fontSize: 12, color: "#bfdbfe", fontFamily: "Helvetica" },
  coverBody:   { paddingHorizontal: 44, paddingTop: 40 },
  coverClient: { fontSize: 28, fontFamily: "Helvetica-Bold", color: P.white, marginBottom: 6, lineHeight: 1.2 },
  coverMeta:   { fontSize: 10, color: P.muted, fontFamily: "Helvetica", marginBottom: 4 },
  coverBottom: { paddingHorizontal: 44, paddingBottom: 44, marginTop: "auto" },
  scoreBadge:  { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: "flex-start", marginBottom: 32 },
  scoreBig:    { fontSize: 40, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  scoreLabel:  { fontSize: 9, fontFamily: "Helvetica", marginTop: 2 },
  dividerLine: { height: 1, backgroundColor: "#1e3a5f", marginVertical: 24 },

  // Section header
  sectionHeader:     { marginBottom: 20 },
  sectionLabel:      { fontSize: 8, color: P.blue, fontFamily: "Helvetica-Bold", letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle:      { fontSize: 18, fontFamily: "Helvetica-Bold", color: P.navy, marginBottom: 4 },
  sectionSubtitle:   { fontSize: 9, color: P.slate, fontFamily: "Helvetica" },

  // Score grid
  scoreGrid:    { flexDirection: "row", gap: 8, marginBottom: 20 },
  scoreCard:    { flex: 1, borderRadius: 6, borderWidth: 1, borderColor: P.border, padding: 12, backgroundColor: P.bg },
  scoreCardVal: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  scoreCardSub: { fontSize: 7.5, color: P.slate },
  scoreBarBg:   { height: 4, backgroundColor: P.border, borderRadius: 2, marginTop: 8 },
  scoreBarFill: { height: 4, borderRadius: 2 },

  // Text box
  textBox:    { backgroundColor: P.bg, borderRadius: 6, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  textBoxText:{ fontSize: 9.5, color: P.navy, lineHeight: 1.55, fontFamily: "Helvetica" },

  // Issue list
  issueList:  { gap: 8, marginBottom: 16 },
  issueItem:  { borderRadius: 5, borderWidth: 1, padding: 10 },
  issueTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  issueDesc:  { fontSize: 8.5, lineHeight: 1.45 },
  issueTag:   { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, alignSelf: "flex-start", marginTop: 4 },
  issueTagTx: { fontSize: 7, fontFamily: "Helvetica-Bold" },

  // Positive list
  positiveItem: { flexDirection: "row", gap: 8, marginBottom: 8 },
  positiveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: P.green, marginTop: 2, flexShrink: 0 },
  positiveText: { flex: 1 },
  positiveName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: P.green, marginBottom: 2 },
  positiveDesc: { fontSize: 8.5, color: P.slate, lineHeight: 1.4 },

  // Recommendation
  recItem:     { flexDirection: "row", gap: 10, borderWidth: 1, borderColor: P.border, borderRadius: 6, padding: 10, marginBottom: 8 },
  recNum:      { width: 20, height: 20, borderRadius: 10, backgroundColor: P.blueLight, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recNumTx:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: P.blue },
  recTitle:    { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  recDesc:     { fontSize: 8.5, color: P.slate, lineHeight: 1.4 },
  recTags:     { flexDirection: "row", gap: 4, marginTop: 4 },
  tag:         { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1.5, borderWidth: 1 },
  tagText:     { fontSize: 7, fontFamily: "Helvetica-Bold" },

  // Messages
  msgCard:     { borderWidth: 1, borderColor: P.border, borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: P.bg },
  msgLabel:    { fontSize: 8, color: P.blue, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, marginBottom: 4 },
  msgText:     { fontSize: 9.5, lineHeight: 1.5 },
  msgMeta:     { fontSize: 7.5, color: P.muted, marginTop: 4 },
  qrRow:       { flexDirection: "row", gap: 8, borderBottomWidth: 1, borderColor: P.border, paddingVertical: 8 },
  qrSlash:     { fontSize: 8, color: P.blue, fontFamily: "Helvetica-Bold", width: 80, flexShrink: 0 },
  qrMsg:       { flex: 1, fontSize: 8.5, lineHeight: 1.4 },

  // Catalog
  catItem:     { borderWidth: 1, borderColor: P.border, borderRadius: 6, padding: 10, marginBottom: 8 },
  catName:     { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  catCat:      { fontSize: 8, color: P.slate, marginBottom: 4 },
  catDesc:     { fontSize: 8.5, lineHeight: 1.4, color: P.navy, marginBottom: 6 },
  catBen:      { flexDirection: "row", gap: 4, marginBottom: 2 },
  catBenDot:   { fontSize: 8.5, color: P.green },
  catBenTx:    { fontSize: 8.5, flex: 1 },
  catFooter:   { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  catPrice:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: P.blue },
  catCta:      { fontSize: 8.5, color: P.slate, fontFamily: "Helvetica-Bold" },

  // Footer
  footer:      { position: "absolute", bottom: 20, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText:  { fontSize: 7.5, color: P.muted },

  // Utility
  row:         { flexDirection: "row" },
  bold:        { fontFamily: "Helvetica-Bold" },
  mb4:         { marginBottom: 4 },
  mb8:         { marginBottom: 8 },
  mb16:        { marginBottom: 16 },
  mb24:        { marginBottom: 24 },
  spacer:      { marginTop: 16 },
  h1:          { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  h2:          { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  body:        { fontSize: 9.5, lineHeight: 1.5, color: P.slate },
})

// ── Sub-components ────────────────────────────────────────────────────────────

function Footer({ page, consultant }: { page: string; consultant: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Business Profile Optimizer AI · {consultant}</Text>
      <Text style={s.footerText}>{page}</Text>
    </View>
  )
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionLabel}>{label.toUpperCase()}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
      {subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
    </View>
  )
}

function ScoreBar({ score, max, color }: { score: number; max: number; color: string }) {
  return (
    <View style={s.scoreBarBg}>
      <View style={[s.scoreBarFill, { width: `${Math.round((score / max) * 100)}%`, backgroundColor: color }]} />
    </View>
  )
}

function IssueSection({
  title, issues, borderColor, bgColor, textColor,
}: {
  title:       string
  issues:      Array<{ title: string; description: string; area: string }>
  borderColor: string
  bgColor:     string
  textColor:   string
}) {
  if (issues.length === 0) return null
  return (
    <View style={s.mb16}>
      <Text style={[s.h2, { color: textColor }]}>{title} ({issues.length})</Text>
      <View style={s.issueList}>
        {issues.map((issue, i) => (
          <View key={i} style={[s.issueItem, { borderColor, backgroundColor: bgColor }]}>
            <Text style={[s.issueTitle, { color: P.navy }]}>{issue.title}</Text>
            <Text style={[s.issueDesc, { color: P.slate }]}>{issue.description}</Text>
            <View style={[s.issueTag, { backgroundColor: borderColor + "20" }]}>
              <Text style={[s.issueTagTx, { color: textColor }]}>{AREA_LABELS[issue.area] ?? issue.area}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Pages ─────────────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: ReportData }) {
  const score = data.audit?.total_score
  const color = score != null ? scoreColor(score) : P.blue

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top blue band */}
      <View style={s.coverTop}>
        <Text style={s.coverLabel}>BUSINESS PROFILE OPTIMIZER AI</Text>
        <Text style={s.coverTitle}>Informe de Optimización{"\n"}de Perfil WhatsApp Business</Text>
        <Text style={s.coverSub}>Proyecto: {data.project.name}</Text>
      </View>

      {/* Body */}
      <View style={s.coverBody}>
        {/* Client name */}
        <Text style={s.coverClient}>{data.client.business_name}</Text>
        {data.client.owner_name && (
          <Text style={s.coverMeta}>{data.client.owner_name}</Text>
        )}
        <Text style={s.coverMeta}>{data.client.sector}{data.client.city ? ` · ${data.client.city}` : ""}</Text>

        <View style={s.dividerLine} />

        {/* Score if available */}
        {score != null && (
          <View style={[s.scoreBadge, { backgroundColor: color + "18", borderWidth: 1, borderColor: color + "40" }]}>
            <Text style={[s.scoreBig, { color }]}>{score}</Text>
            <Text style={[s.scoreLabel, { color: P.slate }]}>Puntuación inicial / 100</Text>
          </View>
        )}

        {data.project.objective && (
          <Text style={[s.body, s.mb8]}>Objetivo: {data.project.objective}</Text>
        )}
      </View>

      {/* Bottom */}
      <View style={s.coverBottom}>
        <View style={s.dividerLine} />
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.coverMeta}>Consultor: {data.consultant_name}</Text>
          <Text style={s.coverMeta}>{data.generated_at}</Text>
        </View>
      </View>
    </Page>
  )
}

function ExecutiveSummaryPage({ data }: { data: ReportData }) {
  const audit = data.audit
  if (!audit) return null

  const dims = [
    { label: "Identidad",      score: audit.scores_breakdown.identity,      max: 25 },
    { label: "Información",    score: audit.scores_breakdown.information,    max: 25 },
    { label: "Catálogo",       score: audit.scores_breakdown.catalog,        max: 25 },
    { label: "Comunicación",   score: audit.scores_breakdown.communication,  max: 25 },
  ]

  return (
    <Page size="A4" style={s.page}>
      <SectionTitle
        label="Resumen ejecutivo"
        title="Resumen del diagnóstico"
        subtitle={`Perfil de ${data.client.business_name} analizado el ${data.generated_at}`}
      />

      {/* Score total */}
      <View style={[s.textBox, { borderColor: scoreColor(audit.total_score) + "40", backgroundColor: scoreColor(audit.total_score) + "08" }]}>
        <Text style={[s.bold, { fontSize: 10, color: P.slate, marginBottom: 4 }]}>Puntuación global</Text>
        <Text style={{ fontSize: 36, fontFamily: "Helvetica-Bold", color: scoreColor(audit.total_score) }}>
          {audit.total_score}<Text style={{ fontSize: 14, color: P.muted }}>/100</Text>
        </Text>
      </View>

      {/* Score grid */}
      <View style={s.scoreGrid}>
        {dims.map((d) => (
          <View key={d.label} style={s.scoreCard}>
            <Text style={[s.scoreCardVal, { color: scoreColor(d.score, d.max) }]}>{d.score}<Text style={{ fontSize: 9, color: P.muted }}>/{d.max}</Text></Text>
            <Text style={s.scoreCardSub}>{d.label}</Text>
            <ScoreBar score={d.score} max={d.max} color={scoreColor(d.score, d.max)} />
          </View>
        ))}
      </View>

      {/* Diagnosis */}
      {audit.ai_diagnosis && (
        <View style={s.mb16}>
          <Text style={[s.h2, { color: P.navy }]}>Diagnóstico general</Text>
          <View style={s.textBox}>
            <Text style={s.textBoxText}>{audit.ai_diagnosis}</Text>
          </View>
        </View>
      )}

      {/* Top findings */}
      {audit.critical_issues.length > 0 && (
        <View style={s.mb16}>
          <Text style={[s.h2, { color: P.red }]}>Principales problemas críticos</Text>
          {audit.critical_issues.slice(0, 3).map((issue, i) => (
            <View key={i} style={[s.row, s.mb8, { gap: 8 }]}>
              <Text style={{ color: P.red, fontFamily: "Helvetica-Bold", fontSize: 9 }}>✗</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.bold, { fontSize: 9 }]}>{issue.title}</Text>
                <Text style={[s.body, { fontSize: 8.5 }]}>{issue.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {audit.positive_aspects.length > 0 && (
        <View>
          <Text style={[s.h2, { color: P.green }]}>Puntos positivos destacados</Text>
          {audit.positive_aspects.slice(0, 3).map((p, i) => (
            <View key={i} style={[s.row, s.mb8, { gap: 8 }]}>
              <Text style={{ color: P.green, fontFamily: "Helvetica-Bold", fontSize: 9 }}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.bold, { fontSize: 9 }]}>{p.title}</Text>
                <Text style={[s.body, { fontSize: 8.5 }]}>{p.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Footer page="Resumen ejecutivo" consultant={data.consultant_name} />
    </Page>
  )
}

function DiagnosisPage({ data }: { data: ReportData }) {
  const audit = data.audit
  if (!audit) return null

  return (
    <Page size="A4" style={s.page}>
      <SectionTitle label="Diagnóstico" title="Análisis detallado del perfil" />

      <IssueSection
        title="Problemas críticos"
        issues={audit.critical_issues}
        borderColor={P.red}
        bgColor={P.redBg}
        textColor={P.red}
      />
      <IssueSection
        title="Problemas moderados"
        issues={audit.moderate_issues}
        borderColor={P.yellow}
        bgColor={P.yellowBg}
        textColor={P.yellow}
      />
      <IssueSection
        title="Mejoras menores"
        issues={audit.minor_issues}
        borderColor={P.blue}
        bgColor={P.blueLight}
        textColor={P.blue}
      />

      {audit.positive_aspects.length > 0 && (
        <View>
          <Text style={[s.h2, { color: P.green }]}>Aspectos positivos ({audit.positive_aspects.length})</Text>
          {audit.positive_aspects.map((p, i) => (
            <View key={i} style={s.positiveItem}>
              <View style={s.positiveDot} />
              <View style={s.positiveText}>
                <Text style={s.positiveName}>{p.title}</Text>
                <Text style={s.positiveDesc}>{p.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Footer page="Diagnóstico completo" consultant={data.consultant_name} />
    </Page>
  )
}

function RecommendationsPage({ data }: { data: ReportData }) {
  const audit = data.audit
  if (!audit || audit.recommendations.length === 0) return null

  return (
    <Page size="A4" style={s.page}>
      <SectionTitle
        label="Recomendaciones"
        title="Plan de acción"
        subtitle="Pasos concretos para optimizar el perfil de WhatsApp Business"
      />

      {audit.recommendations.map((rec, i) => (
        <View key={i} style={s.recItem}>
          <View style={s.recNum}>
            <Text style={s.recNumTx}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.recTitle}>{rec.title}</Text>
            <Text style={s.recDesc}>{rec.description}</Text>
            <View style={s.recTags}>
              <View style={[s.tag, {
                borderColor: priorityColor(rec.priority) + "60",
                backgroundColor: priorityColor(rec.priority) + "10",
              }]}>
                <Text style={[s.tagText, { color: priorityColor(rec.priority) }]}>
                  {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"} prioridad
                </Text>
              </View>
              <View style={[s.tag, { borderColor: P.border, backgroundColor: P.bg }]}>
                <Text style={[s.tagText, { color: P.slate }]}>{AREA_LABELS[rec.area] ?? rec.area}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      <Footer page="Plan de acción" consultant={data.consultant_name} />
    </Page>
  )
}

function MessagesPage({ data }: { data: ReportData }) {
  const messages = data.messages
  if (!messages) return null

  return (
    <Page size="A4" style={s.page}>
      <SectionTitle
        label="Mensajes optimizados"
        title="Mensajes para WhatsApp Business"
        subtitle={`Tono: ${TONE_LABELS[messages.tone] ?? messages.tone}`}
      />

      {/* Welcome messages */}
      <Text style={[s.h2, s.mb8]}>Mensajes de bienvenida</Text>
      {messages.welcome_messages.map((msg, i) => (
        <View key={i} style={s.msgCard}>
          <Text style={s.msgLabel}>{msg.label}</Text>
          <Text style={s.msgText}>{msg.text}</Text>
          <Text style={s.msgMeta}>{msg.text.length} caracteres</Text>
        </View>
      ))}

      {/* Away message */}
      <View style={s.mb16}>
        <Text style={[s.h2, s.mb8]}>Mensaje de ausencia</Text>
        <View style={[s.msgCard, { borderColor: P.yellow + "60", backgroundColor: P.yellowBg }]}>
          <Text style={s.msgText}>{messages.away_message}</Text>
          <Text style={s.msgMeta}>{messages.away_message.length} caracteres</Text>
        </View>
      </View>

      {/* Quick replies */}
      <Text style={[s.h2, s.mb8]}>Respuestas rápidas ({messages.quick_replies.length})</Text>
      <View style={{ borderWidth: 1, borderColor: P.border, borderRadius: 6, overflow: "hidden" }}>
        {messages.quick_replies.map((reply, i) => (
          <View key={i} style={[s.qrRow, { backgroundColor: i % 2 === 0 ? P.white : P.bg, paddingHorizontal: 10 }]}>
            <Text style={s.qrSlash}>/{reply.title.toLowerCase().replace(/\s+/g, "_")}</Text>
            <Text style={s.qrMsg}>{reply.message}</Text>
          </View>
        ))}
      </View>

      <Footer page="Mensajes optimizados" consultant={data.consultant_name} />
    </Page>
  )
}

function CatalogPage({ data }: { data: ReportData }) {
  const catalog = data.catalog
  if (!catalog || catalog.items.length === 0) return null

  return (
    <Page size="A4" style={s.page}>
      <SectionTitle
        label="Catálogo"
        title={catalog.name}
        subtitle={`${catalog.items.length} producto${catalog.items.length !== 1 ? "s" : ""} optimizados para WhatsApp Business`}
      />

      {catalog.items.map((item, i) => (
        <View key={i} style={s.catItem}>
          <Text style={s.catName}>{item.name}</Text>
          {item.category && <Text style={s.catCat}>{item.category}</Text>}
          {item.description && <Text style={s.catDesc}>{item.description}</Text>}
          {item.benefits.slice(0, 3).map((b, bi) => (
            <View key={bi} style={s.catBen}>
              <Text style={s.catBenDot}>✓</Text>
              <Text style={s.catBenTx}>{b}</Text>
            </View>
          ))}
          <View style={s.catFooter}>
            {item.price != null && item.price > 0 && (
              <Text style={s.catPrice}>{item.currency} {Number(item.price).toLocaleString("es-ES")}</Text>
            )}
            {item.cta && <Text style={s.catCta}>{item.cta}</Text>}
          </View>
        </View>
      ))}

      <Footer page="Catálogo de productos" consultant={data.consultant_name} />
    </Page>
  )
}

// ── Main Document ─────────────────────────────────────────────────────────────

export function ReportDocument({ data }: { data: ReportData }) {
  const has = (section: string) => data.sections.includes(section)

  return (
    <Document
      title={`Informe BPO AI — ${data.client.business_name}`}
      author="Business Profile Optimizer AI"
      creator="BPO AI"
    >
      <CoverPage data={data} />
      {has("executive_summary") && <ExecutiveSummaryPage data={data} />}
      {has("diagnosis")         && <DiagnosisPage data={data} />}
      {has("recommendations")   && <RecommendationsPage data={data} />}
      {has("messages")          && <MessagesPage data={data} />}
      {has("catalog")           && <CatalogPage data={data} />}
    </Document>
  )
}
