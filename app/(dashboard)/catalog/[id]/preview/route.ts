import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { CatalogPDF } from "@/features/catalogs/components/CatalogPDF"
import React from "react"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("No autorizado", { status: 401 })

  const { id } = await params

  const [{ data: catalog }, { data: items }] = await Promise.all([
    supabase
      .from("catalogs")
      .select("id, name, projects(name), clients(business_name, city, sector)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("catalog_items")
      .select("id, name, description, price, currency, category, image_url, benefits, cta, status")
      .eq("catalog_id", id)
      .eq("user_id", user.id)
      .neq("status", "draft")
      .order("sort_order", { ascending: true }),
  ])

  if (!catalog) return new NextResponse("Catálogo no encontrado", { status: 404 })

  const client  = Array.isArray(catalog.clients)  ? catalog.clients[0]  : catalog.clients
  const project = Array.isArray(catalog.projects) ? catalog.projects[0] : catalog.projects

  const pdfData = {
    catalogName:  catalog.name,
    businessName: (client as { business_name: string } | null)?.business_name ?? "Mi Negocio",
    city:         (client as { city?: string } | null)?.city ?? "",
    projectName:  (project as { name: string } | null)?.name ?? "",
    items: (items ?? []).map((i) => ({
      id:          i.id,
      name:        i.name,
      description: i.description ?? "",
      price:       i.price ? `${(i.currency ?? "USD").toUpperCase()} ${Number(i.price).toLocaleString("es-ES")}` : "",
      category:    i.category ?? "",
      benefits:    Array.isArray(i.benefits) ? (i.benefits as string[]) : [],
      cta:         i.cta ?? "",
      image_url:   i.image_url ?? "",
    })),
  }

  const buffer = await renderToBuffer(
    React.createElement(CatalogPDF, pdfData) as Parameters<typeof renderToBuffer>[0]
  )

  const filename = `${pdfData.businessName.toLowerCase().replace(/\s+/g, "-")}-catalogo.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
