"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { clientSchema, type ClientFormValues } from "../schemas/client.schema"
import { createClientAction, updateClientAction } from "../actions/client.actions"
import { SECTORS, CLIENT_SOURCES } from "@/constants/navigation"
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

interface ClientFormProps {
  mode: "create" | "edit"
  clientId?: string
  defaultValues?: Partial<ClientFormValues>
}

export function ClientForm({ mode, clientId, defaultValues }: ClientFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as unknown as Resolver<ClientFormValues>,
    defaultValues: {
      status: "active" as const,
      sector: "",
      ...defaultValues,
    },
  })

  const [serverError, setServerError] = useState<string | null>(null)
  const sectorValue = watch("sector")
  const statusValue = watch("status")
  const sourceValue = watch("source")

  function onSubmit(data: ClientFormValues) {
    setServerError(null)
    startTransition(async () => {
      if (mode === "create") {
        const result = await createClientAction(data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace("/clients?created=1")
        }
      } else if (clientId) {
        const result = await updateClientAction(clientId, data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace(`/clients/${clientId}?updated=1`)
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

      {/* Información del negocio */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Información del negocio
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del negocio *" error={errors.business_name?.message}>
            <Input
              {...register("business_name")}
              placeholder="Ej: Restaurante La Paloma"
              className={cn(errors.business_name && "border-red-500")}
            />
          </Field>

          <Field label="Nombre del dueño" error={errors.owner_name?.message}>
            <Input
              {...register("owner_name")}
              placeholder="Ej: Carlos García"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sector *" error={errors.sector?.message}>
            <Select
              defaultValue={defaultValues?.sector}
              onValueChange={(v) => v && setValue("sector", v, { shouldValidate: true })}
            >
              <SelectTrigger className={cn(errors.sector && "border-red-500")}>
                <SelectValue placeholder="Selecciona un sector…">
                  {sectorValue ? SECTORS.find((s) => s.value === sectorValue)?.label : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Ciudad" error={errors.city?.message}>
            <Input
              {...register("city")}
              placeholder="Ej: Buenos Aires"
            />
          </Field>
        </div>

        <Field label="Descripción del negocio" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            placeholder="¿A qué se dedica este negocio? ¿Cuál es su propuesta de valor?"
            rows={3}
          />
        </Field>
      </section>

      <Divider />

      {/* Contacto */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Contacto
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp Business" error={errors.whatsapp_phone?.message}>
            <Input
              {...register("whatsapp_phone")}
              placeholder="+54 9 11 1234-5678"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="contacto@negocio.com"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sitio web" error={errors.website?.message}>
            <Input
              {...register("website")}
              placeholder="https://www.negocio.com"
            />
          </Field>

          <Field label="Link de WhatsApp" error={errors.whatsapp_link?.message}>
            <Input
              {...register("whatsapp_link")}
              placeholder="https://wa.me/549111234567"
            />
          </Field>
        </div>
      </section>

      <Divider />

      {/* Gestión interna */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Gestión interna
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Estado" error={errors.status?.message}>
            <Select
              defaultValue={defaultValues?.status ?? "active"}
              onValueChange={(v) => setValue("status", v as "active" | "potential" | "archived")}
            >
              <SelectTrigger>
                <SelectValue>
                  {statusValue === "active" ? "Activo" : statusValue === "potential" ? "Potencial" : "Archivado"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="potential">Potencial</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Origen" error={errors.source?.message}>
            <Select
              defaultValue={defaultValues?.source}
              onValueChange={(v) => setValue("source", v ?? undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿Cómo llegó?">
                  {sourceValue ? CLIENT_SOURCES.find((s) => s.value === sourceValue)?.label : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CLIENT_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Precio del servicio (USD)" error={errors.price?.message}>
            <Input
              {...register("price")}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Próximo seguimiento" error={errors.next_followup?.message}>
            <Input
              {...register("next_followup")}
              type="date"
            />
          </Field>
        </div>

        <Field label="Notas internas" error={errors.notes?.message}>
          <Textarea
            {...register("notes")}
            placeholder="Observaciones, contexto del cliente, detalles del acuerdo…"
            rows={3}
          />
        </Field>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link
          href={mode === "edit" && clientId ? `/clients/${clientId}` : "/clients"}
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
          {mode === "create" ? "Crear cliente" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}

// Subcomponentes locales
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
