import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { deleteReportAction } from "@/features/reports/actions/report.actions"
import { ArrowLeft, Download, FileText, Calendar, CheckCircle2 } from "lucide-react"
import type { Metadata } from "next"

const SECTION_LABELS: Record<string, string> = {
  executive_summary: "Resumen ejecutivo",
  diagnosis:         "Diagnóstico completo",
  recommendations:   "Plan de acción",
  messages:          "Mensajes optimizados",
  catalog:           "Catálogo de productos",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id }   = await params
  const { data } = await supabase.from("reports").select("title").eq("id", id).single()
  return { title: data ? `${data.title} | BPO AI` : "Informe | BPO AI" }
}

export default async function ReportDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: report } = await supabase
    .from("reports")
    .select("*, projects(id, name), clients(id, business_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!report) notFound()

  const project  = Array.isArray(report.projects) ? report.projects[0] : report.projects
  const client   = Array.isArray(report.clients)  ? report.clients[0]  : report.clients
  const sections = Array.isArray(report.sections) ? report.sections as string[] : []
  const config   = (report.config ?? {}) as { consultant_name?: string }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={project ? `/projects/${(project as { id: string }).id}` : "/reports"}
            className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {(project as { name: string } | null)?.name ?? "Informes"}
          </Link>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(client as { business_name: string } | null)?.business_name}
          </p>
        </div>

        {/* Download button */}
        <a
          href={`/api/pdf/${id}`}
          className={buttonVariants({ size: "lg" })}
          download
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </a>
      </div>

      {/* Estado */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${
        report.status === "generated"
          ? "border-green-500/30 bg-green-500/5"
          : "border-blue-500/30 bg-blue-500/5"
      }`}>
        {report.status === "generated" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
        ) : (
          <FileText className="h-5 w-5 shrink-0 text-blue-400" />
        )}
        <div>
          <p className="text-sm font-medium">
            {report.status === "generated" ? "PDF generado correctamente" : "Listo para generar"}
          </p>
          {report.generated_at && (
            <p className="text-xs text-muted-foreground">
              Última generación: {new Date(report.generated_at).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
          {report.status !== "generated" && (
            <p className="text-xs text-muted-foreground">
              Haz clic en &quot;Descargar PDF&quot; para generar y descargar el informe.
            </p>
          )}
        </div>
      </div>

      {/* Resumen de configuración */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Contenido del informe
        </h2>

        <div className="space-y-2">
          {/* Portada — siempre incluida */}
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            <span>Portada</span>
            <span className="ml-auto text-xs text-muted-foreground">Siempre incluida</span>
          </div>

          {sections.map((s) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
              <span>{SECTION_LABELS[s] ?? s}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          {config.consultant_name && (
            <div className="flex gap-2 text-sm">
              <span className="text-muted-foreground">Consultor:</span>
              <span>{config.consultant_name}</span>
            </div>
          )}
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Creado:
            </span>
            <span>{new Date(report.created_at).toLocaleDateString("es-ES")}</span>
          </div>
        </div>
      </div>

      {/* Nota sobre datos */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Nota:</span> El PDF toma los datos más recientes del proyecto al momento de la descarga — la auditoría más reciente, el último set de mensajes generado y el catálogo activo. Cada descarga genera un PDF actualizado.
        </p>
      </div>

      {/* Zona de peligro */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Zona de peligro
        </h2>
        <form
          action={async () => {
            "use server"
            const result = await deleteReportAction(id)
            if (!("error" in result)) redirect("/reports")
          }}
        >
          <button
            type="submit"
            className={
              buttonVariants({ variant: "outline", size: "sm" }) +
              " border-red-500/30 text-red-400 hover:bg-red-500/10"
            }
          >
            Eliminar informe
          </button>
        </form>
      </div>
    </div>
  )
}
