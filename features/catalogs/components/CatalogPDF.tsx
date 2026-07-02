import {
  Document, Page, Text, View, StyleSheet, Font, Image,
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
  // Header
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
  // Items
  grid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           12,
  },
  card: {
    width:           "47.5%",
    border:          1,
    borderColor:     BORDER,
    borderRadius:    6,
    overflow:        "hidden",
    marginBottom:    12,
  },
  cardImage: {
    width:           "100%",
    height:          90,
    objectFit:       "cover",
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   5,
  },
  itemName: {
    fontSize:   11,
    fontWeight: "bold",
    color:      DARK,
    flex:       1,
    marginRight: 6,
  },
  price: {
    fontSize:   11,
    fontWeight: "bold",
    color:      BRAND,
    flexShrink: 0,
  },
  category: {
    fontSize:    8,
    color:       GRAY,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize:     9,
    color:        GRAY,
    lineHeight:   1.5,
    marginBottom: 5,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems:    "flex-start",
    gap:           4,
    marginBottom:  2,
  },
  bullet: {
    fontSize:  9,
    color:     BRAND,
    marginTop: 0.5,
  },
  benefitText: {
    fontSize:  9,
    color:     GRAY,
    flex:      1,
    lineHeight: 1.4,
  },
  cta: {
    marginTop:       6,
    fontSize:        8,
    fontWeight:      "bold",
    color:           WHITE,
    backgroundColor: BRAND,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    3,
    alignSelf:       "flex-start",
  },
  // Footer
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
  // Section title
  sectionTitle: {
    fontSize:      12,
    fontWeight:    "bold",
    color:         DARK,
    marginBottom:  12,
    paddingBottom:  6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  emptyNote: {
    fontSize:  10,
    color:     GRAY,
    textAlign: "center",
    marginTop: 40,
  },
  // Cover meta row
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
  countBadge: {
    backgroundColor: LIGHT,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical:   2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  countText: {
    fontSize:   8,
    color:      GRAY,
  },
})

interface PDFItem {
  id:          string
  name:        string
  description: string
  price:       string
  category:    string
  benefits:    string[]
  cta:         string
  image_url:   string
}

interface CatalogPDFProps {
  catalogName:  string
  businessName: string
  city:         string
  projectName:  string
  items:        PDFItem[]
}

export function CatalogPDF({ catalogName, businessName, city, projectName, items }: CatalogPDFProps) {
  const today = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

  return (
    <Document
      title={`${businessName} — ${catalogName}`}
      author="Business Profile Optimizer AI"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>CATÁLOGO DE PRODUCTOS</Text>
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.subhead}>{catalogName}</Text>
          <View style={styles.metaRow}>
            {city ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Ciudad: </Text>
                <Text style={styles.metaValue}>{city}</Text>
              </View>
            ) : null}
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
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length} producto{items.length !== 1 ? "s" : ""}</Text>
          </View>
        </View>

        {/* Products */}
        {items.length === 0 ? (
          <Text style={styles.emptyNote}>Este catálogo no tiene productos activos todavía.</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Productos y Servicios</Text>
            <View style={styles.grid}>
              {items.map((item) => (
                <View key={item.id} style={styles.card}>
                  {item.image_url ? (
                    // eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer, no acepta alt
                    <Image style={styles.cardImage} src={item.image_url} />
                  ) : null}
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.price ? <Text style={styles.price}>{item.price}</Text> : null}
                    </View>

                    {item.category ? <Text style={styles.category}>{item.category}</Text> : null}

                    {item.description ? (
                      <Text style={styles.description}>{item.description}</Text>
                    ) : null}

                    {item.benefits.slice(0, 3).map((b, i) => (
                      <View key={i} style={styles.benefitRow}>
                        <Text style={styles.bullet}>✓</Text>
                        <Text style={styles.benefitText}>{b}</Text>
                      </View>
                    ))}

                    {item.cta ? <Text style={styles.cta}>{item.cta}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{businessName} · {catalogName}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={styles.footerText}>Generado con BPO AI</Text>
        </View>
      </Page>
    </Document>
  )
}
