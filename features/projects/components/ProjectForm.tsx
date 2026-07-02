"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { projectSchema, type ProjectFormValues } from "../schemas/project.schema"
import { createProjectAction, updateProjectAction } from "../actions/project.actions"
import { PROJECT_STATUSES, SERVICE_TYPES } from "@/constants/navigation"
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
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface ClientOption {
  id: string
  business_name: string
}

interface ProjectFormProps {
  mode: "create" | "edit"
  projectId?: string
  clients: ClientOption[]
  defaultValues?: Partial<ProjectFormValues>
}

export function ProjectForm({ mode, projectId, clients, defaultValues }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as unknown as Resolver<ProjectFormValues>,
    defaultValues: {
      status: "pending" as const,
      ...defaultValues,
    },
  })

  const [serverError, setServerError] = useState<string | null>(null)
  const statusValue = watch("status")
  const serviceTypeValue = watch("service_type")
  const clientIdValue = watch("client_id")

  function onSubmit(data: ProjectFormValues) {
    setServerError(null)
    startTransition(async () => {
      if (mode === "create") {
        const result = await createProjectAction(data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace(`/projects/${result.projectId}?created=1`)
        }
      } else if (projectId) {
        const result = await updateProjectAction(projectId, data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace(`/projects/${projectId}?updated=1`)
        }
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

      {/* Información del proyecto */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Información del proyecto
        </h3>

        <Field label="Cliente *" error={errors.client_id?.message}>
          <Select
            defaultValue={defaultValues?.client_id}
            onValueChange={(v) => v && setValue("client_id", v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.client_id && "border-red-500")}>
              <SelectValue placeholder="Selecciona un cliente…">
                {clientIdValue ? clients.find((c) => c.id === clientIdValue)?.business_name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del proyecto *" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Ej: Optimización perfil Q1 2025"
              className={cn(errors.name && "border-red-500")}
            />
          </Field>

          <Field label="Tipo de servicio" error={errors.service_type?.message}>
            <Select
              defaultValue={defaultValues?.service_type}
              onValueChange={(v) => v && setValue("service_type", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo…">
                  {serviceTypeValue ? SERVICE_TYPES.find((s) => s.value === serviceTypeValue)?.label : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Objetivo" error={errors.objective?.message}>
          <Textarea
            {...register("objective")}
            placeholder="¿Qué se busca lograr con este proyecto?"
            rows={3}
          />
        </Field>
      </section>

      <Divider />

      {/* Gestión */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Gestión
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Estado" error={errors.status?.message}>
            <Select
              defaultValue={defaultValues?.status ?? "pending"}
              onValueChange={(v) => setValue("status", v as ProjectFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue>
                  {PROJECT_STATUSES.find((s) => s.value === statusValue)?.label ?? "Pendiente"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fecha de entrega" error={errors.delivery_date?.message}>
            <Input
              {...register("delivery_date")}
              type="date"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Score inicial (0–100)" error={errors.initial_score?.message}>
            <Input
              {...register("initial_score")}
              type="number"
              min="0"
              max="100"
              placeholder="0"
            />
          </Field>

          <Field label="Score proyectado (0–100)" error={errors.projected_score?.message}>
            <Input
              {...register("projected_score")}
              type="number"
              min="0"
              max="100"
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="Notas internas" error={errors.notes?.message}>
          <Textarea
            {...register("notes")}
            placeholder="Observaciones, acuerdos, próximos pasos…"
            rows={3}
          />
        </Field>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link
          href={mode === "edit" && projectId ? `/projects/${projectId}` : "/projects"}
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Link>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === "create" ? "Crear proyecto" : "Guardar cambios"}
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
