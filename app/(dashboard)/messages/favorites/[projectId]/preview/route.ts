import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { MessageFavoritesPDF } from "@/features/messages/components/MessageFavoritesPDF"
import React from "react"

interface RouteParams {
  params: Promise<{ projectId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("No autorizado", { status: 401 })

  const { projectId } = await params

  const [{ data: project }, { data: favorites }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, clients(business_name)")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("message_favorites")
      .select("id, category, label, text")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ])

  if (!project) return new NextResponse("Proyecto no encontrado", { status: 404 })

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients

  const pdfData = {
    businessName: (client as { business_name: string } | null)?.business_name ?? "Mi Negocio",
    projectName:  project.name ?? "",
    items: (favorites ?? []).map((f) => ({
      id:       f.id,
      category: f.category,
      label:    f.label,
      text:     f.text,
    })),
  }

  const buffer = await renderToBuffer(
    React.createElement(MessageFavoritesPDF, pdfData) as Parameters<typeof renderToBuffer>[0]
  )

  const filename = `${pdfData.businessName.toLowerCase().replace(/\s+/g, "-")}-mensajes.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
