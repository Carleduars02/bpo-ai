"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { reportSchema, type ReportFormValues, SECTION_OPTIONS } from "../schemas/report.schema"
import { createReportAction } from "../actions/report.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2, FileText, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface ProjectOption {
  id:      string
  name:    string
  clients: { business_name: string } | null
}

interface ReportFormProps {
  projects:         ProjectOption[]
  defaultProjectId?: string
  defaultConsultant?: string
}

export function ReportForm({ projects, defaultProjectId, defaultConsultant }: ReportFormProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as unknown as Resolver<ReportFormValues>,
    defaultValues: {
      project_id:      defaultProjectId ?? "",
      title:           "Informe de Optimización de Perfil WhatsApp Business",
      consultant_name: defaultConsultant ?? "",
      sections:        ["executive_summary", "diagnosis", "recommendations"],
    },
  })

  const projectIdValue = watch("project_id")
  const sectionsValue  = watch("sections") ?? []

  function toggleSection(value: string) {
    const current = sectionsValue
    if (current.includes(value as never)) {
      setValue("sections", current.filter((s) => s !== value) as ReportFormValues["sections"], { shouldValidate: true })
    } else {
      setValue("sections", [...current, value] as ReportFormValues["sections"], { shouldValidate: true })
    }
  }

  function onSubmit(data: ReportFormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await createReportAction(data)
      if ("error" in result) {
        setServerError(result.error)
      } else {
        window.location.replace(`/reports/${result.reportId}`)
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

      {/* Proyecto */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Proyecto
        </h3>

        <Field label="Proyecto *" error={errors.project_id?.message}>
          <Select
            defaultValue={defaultProjectId}
            onValueChange={(v) => {
              if (!v) return
              setValue("project_id", v, { shouldValidate: true })
              const p = projects.find((x) => x.id === v)
              if (p) {
                setValue("title", `Informe — ${p.clients?.business_name ?? p.name}`)
              }
            }}
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

      <Divider />

      {/* Configuración */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Configuración del informe
        </h3>

        <Field label="Título del informe" error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="Informe de Optimización de Perfil WhatsApp Business"
            className={cn(errors.title && "border-red-500")}
          />
        </Field>

        <Field label="Nombre del consultor" error={undefined}>
          <Input
            {...register("consultant_name")}
            placeholder="Tu nombre completo (aparece en el PDF)"
          />
        </Field>
      </section>

      <Divider />

      {/* Secciones */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Secciones del informe
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            La portada siempre se incluye. Selecciona las secciones adicionales.
          </p>
        </div>

        <div className="space-y-2">
          {SECTION_OPTIONS.map((section) => {
            const active = sectionsValue.includes(section.value as never)
            return (
              <button
                key={section.value}
                type="button"
                onClick={() => toggleSection(section.value)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/50 hover:bg-card"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  active ? "border-primary bg-primary" : "border-border"
                )}>
                  {active && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{section.label}</span>
                    <span className="text-[10px] text-muted-foreground">requiere {section.requires}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        {errors.sections && (
          <p className="text-xs text-red-400">{errors.sections.message}</p>
        )}
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link href="/reports" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Link>

        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando informe…
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Crear informe
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

function Divider() {
  return <hr className="border-border" />
}
