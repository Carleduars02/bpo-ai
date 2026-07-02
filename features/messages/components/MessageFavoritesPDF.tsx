import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer"

Font.register({
  family: "Helvetica",
  fonts: [],
})

const BRAND  = "#2563eb"
const DARK   = "#111827"
const GRAY   = "#6b7280"
const LIGHT  = "#f3f4f6"
const WHITE  = "#ffffff"
const BORDER = "#e5e7eb"

const styles = StyleSheet.create({
  page: {
    fontFamily:   "Helvetica",
    fontSize:     10,
    color:        DARK,
    paddingTop:   48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    backgroundColor: WHITE,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 16,
    marginBottom:  24,
  },
  badge: {
    backgroundColor: BRAND,
    color:           WHITE,
    fontSize:        8,
    fontWeight:      "bold",
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    3,
    alignSelf:       "flex-start",
    marginBottom:    6,
    letterSpacing:   1,
  },
  businessName: {
    fontSize:   22,
    fontWeight: "bold",
    color:      DARK,
    marginBottom: 2,
  },
  subhead: {
    fontSize: 10,
    color:    GRAY,
  },
  metaRow: {
    flexDirection:  "row",
    gap:            16,
    marginTop:      6,
  },
  metaItem: {
    flexDirection: "row",
    gap:           4,
  },
  metaLabel: {
    fontSize:   8,
    color:      GRAY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize:   8,
    color:      DARK,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize:      12,
    fontWeight:    "bold",
    color:         DARK,
    marginTop:     18,
    marginBottom:  10,
    paddingBottom:  6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  card: {
    borderWidth:     1,
    borderColor:     BORDER,
    borderRadius:    6,
    padding:         10,
    marginBottom:    8,
    backgroundColor: LIGHT,
  },
  cardLabel: {
    fontSize:   8,
    color:      GRAY,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize:   10,
    color:      DARK,
    lineHeight: 1.5,
  },
  emptyNote: {
    fontSize:  10,
    color:     GRAY,
    textAlign: "center",
    marginTop: 40,
  },
  footer: {
    position:   "absolute",
    bottom:     24,
    left:       44,
    right:      44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth:  1,
    borderTopColor:  BORDER,
    paddingTop:      8,
  },
  footerText: {
    fontSize: 7,
    color:    GRAY,
  },
})

const CATEGORY_LABELS: Record<string, string> = {
  welcome:     "Mensajes de bienvenida",
  away:        "Mensaje de ausencia",
  quick_reply: "Respuestas rápidas",
  status:      "Estados de WhatsApp",
}

interface FavoriteItem {
  id:       string
  category: string
  label:    string | null
  text:     string
}

interface MessageFavoritesPDFProps {
  businessName: string
  projectName:  string
  items:        FavoriteItem[]
}

export function MessageFavoritesPDF({ businessName, projectName, items }: MessageFavoritesPDFProps) {
  const today = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

  const order = ["welcome", "away", "quick_reply", "status"]
  const grouped = order
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter((g) => g.items.length > 0)

  return (
    <Document title={`${businessName} — Mensajes guardados`} author="Business Profile Optimizer AI">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.badge}>MENSAJES PARA WHATSAPP BUSINESS</Text>
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.subhead}>Mensajes finales guardados</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Fecha: </Text>
              <Text style={styles.metaValue}>{today}</Text>
            </View>
            {projectName ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Proyecto: </Text>
                <Text style={styles.metaValue}>{projectName}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyNote}>Todavía no se guardó ningún mensaje para este proyecto.</Text>
        ) : (
          grouped.map((group) => (
            <View key={group.cat} wrap={false}>
              <Text style={styles.sectionTitle}>{CATEGORY_LABELS[group.cat] ?? group.cat}</Text>
              {group.items.map((item) => (
                <View key={item.id} style={styles.card}>
                  {item.label ? <Text style={styles.cardLabel}>{item.label}</Text> : null}
                  <Text style={styles.cardText}>{item.text}</Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{businessName}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={styles.footerText}>Generado con BPO AI</Text>
        </View>
      </Page>
    </Document>
  )
}
