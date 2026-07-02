"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState, useEffect, useRef } from "react"
import { auditSchema, type AuditFormValues } from "../schemas/audit.schema"
import { createAuditAction } from "../actions/audit.actions"
import { extractProfileFromScreenshotAction, lookupClientFromLinkAction } from "../actions/import.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2, Sparkles, ArrowLeft, ImageUp, Link2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ProjectContextCard } from "@/components/shared/ProjectContextCard"

interface ProjectOption {
  id: string
  name: string
  clients: {
    business_name:  string
    sector?:        string | null
    description?:   string | null
    website?:       string | null
    whatsapp_link?: string | null
  } | null
  catalogProductCount?: number
  messageSet?: {
    hasWelcomeMessage: boolean
    hasAwayMessage:    boolean
    quickRepliesCount: number
  } | null
}

interface AuditFormProps {
  projects: ProjectOption[]
  defaultProjectId?: string
}

const CATALOG_QUALITY_OPTIONS = [
  { value: "1", label: "1 — Muy básico (sin fotos, sin descripciones)" },
  { value: "2", label: "2 — Básico (fotos de baja calidad o incompleto)" },
  { value: "3", label: "3 — Regular (fotos y descripciones mínimas)" },
  { value: "4", label: "4 — Bueno (fotos claras y buenas descripciones)" },
  { value: "5", label: "5 — Excelente (profesional, completo y atractivo)" },
]

const STATUS_FREQUENCY_OPTIONS = [
  { value: "diario", label: "Diario" },
  { value: "2-3_semana", label: "2-3 veces por semana" },
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual o menos" },
]

export function AuditForm({ projects, defaultProjectId }: AuditFormProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema) as unknown as Resolver<AuditFormValues>,
    defaultValues: {
      project_id:            defaultProjectId ?? "",
      has_schedule:          false,
      has_location:          false,
      has_website:           false,
      has_catalog:           false,
      catalog_product_count: 0,
      has_welcome_message:   false,
      has_away_message:      false,
      quick_replies_count:   0,
      posts_status:          false,
      uses_labels:           false,
    },
  })

  const projectIdValue      = watch("project_id")
  const hasCatalog          = watch("has_catalog")
  const postsStatus         = watch("posts_status")
  const catalogQualityValue = watch("catalog_quality")
  const statusFreqValue     = watch("status_frequency")

  const [autoFilledNote, setAutoFilledNote] = useState<string | null>(null)
  const autoFilledProjectRef = useRef<string | null>(null)

  // Auto-fill identity fields from the client record, and catálogo/comunicación
  // fields from los datos reales de Catálogo y Mensajes del proyecto — evita que
  // el consultor vuelva a teclear a mano algo que el sistema ya sabe.
  useEffect(() => {
    if (!projectIdValue || autoFilledProjectRef.current === projectIdValue) return
    const project = projects.find((p) => p.id === projectIdValue)
    if (!project) return

    autoFilledProjectRef.current = projectIdValue
    const filled: string[] = []
    const client = project.clients

    if (client) {
      if (client.business_name && !watch("business_name_input")) {
        setValue("business_name_input", client.business_name)
        filled.push("nombre")
      }
      if (client.description && !watch("description_input")) {
        setValue("description_input", client.description)
        filled.push("descripción")
      }
      if (client.sector && !watch("category_input")) {
        setValue("category_input", client.sector)
        filled.push("categoría")
      }
      if (client.website) {
        setValue("has_website", true)
        filled.push("sitio web")
      }
    }

    const productCount = project.catalogProductCount ?? 0
    if (productCount > 0) {
      setValue("has_catalog", true)
      setValue("catalog_product_count", productCount)
      filled.push("catálogo")
    }

    const messageSet = project.messageSet
    if (messageSet) {
      if (messageSet.hasWelcomeMessage) { setValue("has_welcome_message", true); filled.push("mensaje de bienvenida") }
      if (messageSet.hasAwayMessage)    { setValue("has_away_message", true); filled.push("mensaje de ausencia") }
      if (messageSet.quickRepliesCount > 0) {
        setValue("quick_replies_count", messageSet.quickRepliesCount)
        filled.push("respuestas rápidas")
      }
    }

    if (filled.length > 0) {
      setAutoFilledNote(`Completado automáticamente desde el cliente y los módulos del proyecto: ${filled.join(", ")}.`)
    } else {
      setAutoFilledNote(null)
    }
  }, [projectIdValue, projects, setValue, watch])

  function applyExtractedProfile(data: {
    business_name?: string
    description?:   string
    category?:      string
    has_schedule?:  boolean
    has_location?:  boolean
    has_website?:   boolean
  }) {
    const filled: string[] = []
    if (data.business_name && !watch("business_name_input")) {
      setValue("business_name_input", data.business_name); filled.push("nombre")
    }
    if (data.description && !watch("description_input")) {
      setValue("description_input", data.description); filled.push("descripción")
    }
    if (data.category && !watch("category_input")) {
      setValue("category_input", data.category); filled.push("categoría")
    }
    if (data.has_schedule) { setValue("has_schedule", true); filled.push("horario") }
    if (data.has_location) { setValue("has_location", true); filled.push("ubicación") }
    if (data.has_website)  { setValue("has_website", true); filled.push("sitio web") }
    setAutoFilledNote(filled.length > 0 ? `Importado desde captura: ${filled.join(", ")}.` : null)
  }

  function onSubmit(data: AuditFormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await createAuditAction(data)
      if ("error" in result) {
        setServerError(result.error)
      } else {
        window.location.replace(`/auditor/${result.auditId}?created=1`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Selección de proyecto */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Proyecto
        </h3>
        <Field label="Proyecto a auditar *" error={errors.project_id?.message}>
          <Select
            defaultValue={defaultProjectId}
            onValueChange={(v) => v && setValue("project_id", v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.project_id && "border-red-500")}>
              <SelectValue placeholder="Selecciona un proyecto…">
                {projectIdValue
                  ? (() => {
                      const p = projects.find((x) => x.id === projectIdValue)
                      return p ? `${p.name} — ${p.clients?.business_name ?? ""}` : undefined
                    })()
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p.clients?.business_name && (
                    <span className="ml-1 text-muted-foreground">— {p.clients.business_name}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </section>

      {projectIdValue && (() => {
        const p = projects.find((x) => x.id === projectIdValue)
        return p?.clients ? (
          <ProjectContextCard client={p.clients} />
        ) : null
      })()}

      {projectIdValue && (
        <ImportPanel onImport={applyExtractedProfile} />
      )}

      {autoFilledNote && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {autoFilledNote}
        </div>
      )}

      <Divider />

      {/* IDENTIDAD */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Identidad <span className="text-xs font-normal normal-case text-muted-foreground/60">(hasta 25 pts)</span>
        </h3>

        <Field label="Nombre del negocio en WhatsApp" error={errors.business_name_input?.message}>
          <Input
            {...register("business_name_input")}
            placeholder="Ej: Panadería El Trigo Dorado"
          />
        </Field>

        <Field label="Descripción del perfil" error={errors.description_input?.message}>
          <Textarea
            {...register("description_input")}
            placeholder="Texto exacto de la descripción que aparece en el perfil…"
            rows={3}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría seleccionada" error={errors.category_input?.message}>
            <Input
              {...register("category_input")}
              placeholder="Ej: Panadería, Restaurante, Tienda…"
            />
          </Field>

          <Field label="URL de la foto de perfil" error={errors.profile_photo_url?.message}>
            <Input
              {...register("profile_photo_url")}
              placeholder="https://…"
              type="url"
            />
          </Field>
        </div>
      </section>

      <Divider />

      {/* INFORMACIÓN */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Información <span className="text-xs font-normal normal-case text-muted-foreground/60">(hasta 25 pts)</span>
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <CheckboxField
            label="Horario configurado"
            description="Tiene días y horas de atención"
            id="has_schedule"
            {...register("has_schedule")}
          />
          <CheckboxField
            label="Ubicación configurada"
            description="Tiene dirección o ciudad"
            id="has_location"
            {...register("has_location")}
          />
          <CheckboxField
            label="Sitio web vinculado"
            description="Tiene URL de web o tienda"
            id="has_website"
            {...register("has_website")}
          />
        </div>
      </section>

      <Divider />

      {/* CATÁLOGO */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Catálogo <span className="text-xs font-normal normal-case text-muted-foreground/60">(hasta 25 pts)</span>
        </h3>

        <CheckboxField
          label="Tiene catálogo activo"
          description="El perfil tiene catálogo con al menos 1 producto"
          id="has_catalog"
          {...register("has_catalog")}
        />

        {hasCatalog && (
          <div className="grid gap-4 sm:grid-cols-2 pl-0 animate-in fade-in slide-in-from-top-1">
            <Field label="Número de productos" error={errors.catalog_product_count?.message}>
              <Input
                {...register("catalog_product_count")}
                type="number"
                min="0"
                placeholder="0"
              />
            </Field>

            <Field label="Calidad del catálogo" error={errors.catalog_quality?.message}>
              <Select
                onValueChange={(v) => v && setValue("catalog_quality", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona calidad…">
                    {catalogQualityValue
                      ? CATALOG_QUALITY_OPTIONS.find((o) => o.value === String(catalogQualityValue))?.label
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATALOG_QUALITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
      </section>

      <Divider />

      {/* COMUNICACIÓN */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Comunicación <span className="text-xs font-normal normal-case text-muted-foreground/60">(hasta 25 pts)</span>
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField
            label="Mensaje de bienvenida"
            description="Respuesta automática al primer mensaje"
            id="has_welcome_message"
            {...register("has_welcome_message")}
          />
          <CheckboxField
            label="Mensaje de ausencia"
            description="Respuesta fuera del horario de atención"
            id="has_away_message"
            {...register("has_away_message")}
          />
          <CheckboxField
            label="Publica estados"
            description="Comparte actualizaciones en estados de WA"
            id="posts_status"
            {...register("posts_status")}
          />
          <CheckboxField
            label="Usa etiquetas"
            description="Organiza chats con etiquetas de colores"
            id="uses_labels"
            {...register("uses_labels")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Respuestas rápidas configuradas" error={errors.quick_replies_count?.message}>
            <Input
              {...register("quick_replies_count")}
              type="number"
              min="0"
              placeholder="0"
            />
          </Field>

          {postsStatus && (
            <Field label="Frecuencia de estados" error={errors.status_frequency?.message}>
              <Select
                value={statusFreqValue ?? undefined}
                onValueChange={(v) => v && setValue("status_frequency", v as string, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona frecuencia…">
                    {statusFreqValue
                      ? STATUS_FREQUENCY_OPTIONS.find((o) => o.value === statusFreqValue)?.label
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      </section>

      <Divider />

      {/* Notas adicionales */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Notas adicionales
        </h3>
        <Field label="Observaciones del auditor" error={errors.additional_notes?.message}>
          <Textarea
            {...register("additional_notes")}
            placeholder="Contexto adicional sobre el negocio, industria, competencia o particularidades del perfil…"
            rows={3}
          />
        </Field>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link href="/auditor" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Link>

        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analizando con IA…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar auditoría
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

import { forwardRef } from "react"

const CheckboxField = forwardRef<
  HTMLInputElement,
  {
    label: string
    description: string
    id: string
  } & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, description, id, ...props }, ref) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-card"
  >
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
      {...props}
    />
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </label>
))
CheckboxField.displayName = "CheckboxField"

function Divider() {
  return <hr className="border-border" />
}

interface ExtractedProfileData {
  business_name?: string
  description?:   string
  category?:      string
  has_schedule?:  boolean
  has_location?:  boolean
  has_website?:   boolean
}

function ImportPanel({ onImport }: { onImport: (data: ExtractedProfileData) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode]       = useState<"screenshot" | "link">("screenshot")
  const [link, setLink]       = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(",")[1] ?? ""
        resolve({ base64, mimeType: file.type })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setMessage(null)
    try {
      const { base64, mimeType } = await fileToBase64(file)
      const result = await extractProfileFromScreenshotAction(base64, mimeType)
      if ("error" in result) {
        setMessage({ kind: "error", text: result.error })
      } else {
        onImport(result.data)
        setMessage({ kind: "success", text: result.data.notes ?? "Datos importados desde la captura." })
      }
    } catch {
      setMessage({ kind: "error", text: "No se pudo procesar la imagen." })
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleLinkLookup() {
    if (!link.trim()) return
    setLoading(true)
    setMessage(null)
    const result = await lookupClientFromLinkAction(link.trim())
    if ("error" in result) {
      setMessage({ kind: "error", text: result.error })
    } else {
      onImport(result.data)
      setMessage({ kind: "success", text: "Datos del cliente encontrados y aplicados al formulario." })
    }
    setLoading(false)
  }

  return (
    <section className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Importar datos automáticamente</h3>
        <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("screenshot")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
            mode === "screenshot" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          <ImageUp className="h-3.5 w-3.5" /> Captura de pantalla
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
            mode === "link" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          <Link2 className="h-3.5 w-3.5" /> Enlace de WhatsApp
        </button>
      </div>

      {mode === "screenshot" ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Sube una captura de la pantalla &quot;Info&quot; del perfil de WhatsApp Business. La IA leerá nombre, descripción, categoría, horario y ubicación.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleScreenshot}
            disabled={loading}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://wa.me/521234567890"
            className="text-xs"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleLinkLookup} disabled={loading || !link.trim()}>
            Buscar
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analizando…
        </div>
      )}

      {message && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
            message.kind === "success"
              ? "border-green-500/30 bg-green-500/5 text-green-400"
              : "border-red-500/30 bg-red-500/5 text-red-400"
          )}
        >
          {message.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {mode === "link" && (
        <p className="text-[11px] text-muted-foreground/70">
          Nota: el enlace de WhatsApp no expone los datos del perfil directamente; esta búsqueda usa el número para encontrar el cliente ya registrado en tu base. Para datos del perfil actual (horario, ubicación, foto) usa la captura de pantalla.
        </p>
      )}
    </section>
  )
}
