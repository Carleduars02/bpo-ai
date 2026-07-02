"use client"

import { useActionState, useRef, useState } from "react"
import { createContentAction } from "../actions/content.actions"
import { TONE_OPTIONS, CONTENT_FORMAT_OPTIONS, type ContentFormat } from "../schemas/content.schema"
import { buttonVariants } from "@/components/ui/button"
import { ProjectContextCard, type ProjectContextClient } from "@/components/shared/ProjectContextCard"
import { Wand2, Loader2, FileText, Zap, Tag, PartyPopper } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Project {
  id:               string
  name:             string
  clients:          ProjectContextClient | null
  catalogItemCount: number
}

interface ContentFormProps {
  projects:          Project[]
  defaultProjectId?: string
}

type ActionState = { error: string } | null

const FORMAT_ICONS: Record<ContentFormat, typeof FileText> = {
  profile:  FileText,
  status:   Zap,
  promo:    Tag,
  seasonal: PartyPopper,
}

export function ContentForm({ projects, defaultProjectId }: ContentFormProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    createContentAction,
    null
  )

  const formRef = useRef<HTMLFormElement>(null)
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId ?? "")
  const [format, setFormat] = useState<ContentFormat>("profile")

  const activeProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <form ref={formRef} action={action} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Format */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de contenido</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CONTENT_FORMAT_OPTIONS.map((opt) => {
            const Icon = FORMAT_ICONS[opt.value]
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-background/50 p-3",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                )}
              >
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="sr-only"
                />
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Project */}
      <div className="space-y-3">
        <label className="text-sm font-medium" htmlFor="project_id">
          Proyecto <span className="text-red-400">*</span>
        </label>
        <select
          id="project_id"
          name="project_id"
          required
          defaultValue={defaultProjectId ?? ""}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>Selecciona un proyecto...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clients?.business_name ?? p.name} — {p.name}
            </option>
          ))}
        </select>

        {activeProject?.clients && (
          <ProjectContextCard
            client={activeProject.clients}
            catalogItemCount={activeProject.catalogItemCount}
          />
        )}
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tono de comunicación <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TONE_OPTIONS.map((opt, i) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-lg border border-input bg-background/50 p-3",
                "hover:border-primary/50 hover:bg-primary/5",
                "has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              )}
            >
              <input
                type="radio"
                name="tone"
                value={opt.value}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Promo offer — solo si el formato es Promoción */}
      {format === "promo" && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <label className="text-sm font-medium" htmlFor="promo_offer">
            Oferta o promoción <span className="text-red-400">*</span>
          </label>
          <input
            id="promo_offer"
            name="promo_offer"
            type="text"
            maxLength={200}
            placeholder="Ej. 20% de descuento en pastas los martes, 2x1 en cortes de cabello..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Seasonal occasion — solo si el formato es Fecha especial */}
      {format === "seasonal" && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <label className="text-sm font-medium" htmlFor="seasonal_occasion">
            Fecha o festividad <span className="text-red-400">*</span>
          </label>
          <input
            id="seasonal_occasion"
            name="seasonal_occasion"
            type="text"
            maxLength={100}
            placeholder="Ej. Navidad, Día de la Madre, Verano, Black Friday..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Target audience */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="target_audience">
          Público objetivo
          <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="target_audience"
          name="target_audience"
          type="text"
          maxLength={200}
          placeholder="Ej. mujeres 25–40 años, empresas PYME, estudiantes universitarios..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Unique value */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="unique_value">
          Propuesta única de valor / diferenciadores
          <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="unique_value"
          name="unique_value"
          rows={2}
          maxLength={300}
          placeholder="Ej. 10 años de experiencia, envío en 24 horas, garantía de por vida, atención personalizada..."
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Additional context */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="additional_context">
          Contexto adicional
          <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="additional_context"
          name="additional_context"
          rows={3}
          maxLength={500}
          placeholder="Cualquier información extra que ayude a la IA: premios, certificaciones, zona de cobertura, horarios especiales..."
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(buttonVariants(), "gap-2")}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando contenido...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generar contenido
            </>
          )}
        </button>
        <Link href="/content" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
