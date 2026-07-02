"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState, useEffect, useRef } from "react"
import { messageSetSchema, type MessageSetFormValues, TONE_OPTIONS } from "../schemas/message.schema"
import { createMessageSetAction } from "../actions/message.actions"
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
import { ProjectContextCard, type ProjectContextClient } from "@/components/shared/ProjectContextCard"
import { cn } from "@/lib/utils"
import { Loader2, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface CatalogItem {
  name:     string
  category: string | null
  status:   string
}

interface ProjectOption {
  id:           string
  name:         string
  clients:      ProjectContextClient | null
  catalogItems: CatalogItem[]
}

interface MessageFormProps {
  projects:          ProjectOption[]
  defaultProjectId?: string
}

export function MessageForm({ projects, defaultProjectId }: MessageFormProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MessageSetFormValues>({
    resolver: zodResolver(messageSetSchema) as unknown as Resolver<MessageSetFormValues>,
    defaultValues: {
      project_id: defaultProjectId ?? "",
      tone:       "",
    },
  })

  const projectIdValue = watch("project_id")
  const toneValue      = watch("tone")

  const autoFilledRef = useRef<string | null>(null)

  // When project changes, auto-fill services from catalog items
  useEffect(() => {
    if (!projectIdValue || autoFilledRef.current === projectIdValue) return
    const project = projects.find((p) => p.id === projectIdValue)
    if (!project || project.catalogItems.length === 0) return

    const currentServices = watch("services")
    if (currentServices && currentServices.trim().length > 0) return

    autoFilledRef.current = projectIdValue
    const names = project.catalogItems.map((i) => i.name).join("\n")
    setValue("services", names)
  }, [projectIdValue, projects, setValue, watch])

  const activeProject = projects.find((p) => p.id === projectIdValue)

  function onSubmit(data: MessageSetFormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await createMessageSetAction(data)
      if ("error" in result) {
        setServerError(result.error)
      } else {
        window.location.replace(`/messages/${result.contentId}?created=1`)
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

        {activeProject?.clients && (
          <ProjectContextCard
            client={activeProject.clients}
            catalogItemCount={activeProject.catalogItems.length}
          />
        )}
      </section>

      <Divider />

      {/* Tono y contexto */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Personalización
        </h3>

        <Field label="Tono de comunicación *" error={errors.tone?.message}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TONE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors",
                  toneValue === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/50 hover:bg-card"
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={option.value}
                  checked={toneValue === option.value}
                  onChange={() => setValue("tone", option.value, { shouldValidate: true })}
                />
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </label>
            ))}
          </div>
          {errors.tone && <p className="text-xs text-red-400">{errors.tone.message}</p>}
        </Field>

        <Field label="Horario de atención" error={undefined}>
          <Input
            {...register("schedule")}
            placeholder="Ej: Lunes a viernes de 9 a 18hs, sábados de 9 a 13hs"
          />
        </Field>

        <Field label="Productos / servicios principales" error={undefined}>
          <Textarea
            {...register("services")}
            placeholder="Ej: Cortes de cabello para hombres, afeitado clásico, arreglo de barba, tratamientos capilares…"
            rows={3}
          />
          {activeProject && activeProject.catalogItems.length > 0 && (
            <p className="mt-1 text-[11px] text-primary/70">
              Completado automáticamente desde tu catálogo ({activeProject.catalogItems.length} productos). Puedes editarlo.
            </p>
          )}
        </Field>

        <Field label="Contexto adicional (opcional)" error={undefined}>
          <Textarea
            {...register("additional_context")}
            placeholder="Información extra que ayude a personalizar los mensajes: propuesta de valor, clientes típicos, diferenciadores, etc."
            rows={2}
          />
        </Field>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link href="/messages" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Link>

        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando mensajes…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar mensajes con IA
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
