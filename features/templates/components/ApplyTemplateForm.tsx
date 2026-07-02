"use client"

import { useActionState, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  applyTemplateMessagesAction,
  applyTemplateProfileAction,
  applyTemplateCatalogAction,
} from "../actions/template.actions"
import { buttonVariants } from "@/components/ui/button"
import { Loader2, MessageSquare, Wand2, Package, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id:      string
  name:    string
  clients: { business_name: string } | null
}

interface ApplyTemplateFormProps {
  templateId: string
  projects:   Project[]
}

type ActionState = { error: string } | null

export function ApplyTemplateForm({ templateId, projects }: ApplyTemplateFormProps) {
  const router = useRouter()
  const [projectId, setProjectId] = useState("")
  const [state, messagesAction, isMessagesPending] = useActionState<ActionState, FormData>(
    applyTemplateMessagesAction,
    null
  )
  const [isCatalogPending, startCatalogTransition] = useTransition()
  const [isProfilePending, startProfileTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  const isPending = isMessagesPending || isCatalogPending || isProfilePending

  function handleApplyCatalog() {
    if (!projectId) return
    setFeedback(null)
    startCatalogTransition(async () => {
      const result = await applyTemplateCatalogAction(templateId, projectId)
      if ("error" in result) {
        setFeedback({ kind: "error", text: result.error })
      } else {
        router.push(`/catalog/${result.catalogId}`)
      }
    })
  }

  function handleApplyProfile() {
    if (!projectId) return
    setFeedback(null)
    startProfileTransition(async () => {
      const result = await applyTemplateProfileAction(templateId, projectId)
      if ("error" in result) {
        setFeedback({ kind: "error", text: result.error })
      } else {
        router.push(`/content/${result.contentId}`)
      }
    })
  }

  return (
    <div className="space-y-4">
      {(state?.error || feedback) && (
        <p className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          (feedback?.kind ?? "error") === "error"
            ? "border-red-500/30 bg-red-500/5 text-red-400"
            : "border-green-500/30 bg-green-500/5 text-green-400"
        )}>
          {state?.error ?? feedback?.text}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="project_id_apply">
          Selecciona el proyecto
        </label>
        <select
          id="project_id_apply"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>Selecciona un proyecto...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clients?.business_name ?? p.name} — {p.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Cada acción crea un registro nuevo en el proyecto elegido — puedes editarlo después.
        </p>
      </div>

      <div className="space-y-2">
        <form action={messagesAction}>
          <input type="hidden" name="template_id" value={templateId} />
          <input type="hidden" name="project_id" value={projectId} />
          <button
            type="submit"
            disabled={isPending || !projectId}
            className={cn(buttonVariants(), "w-full gap-2 justify-center")}
          >
            {isMessagesPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            Aplicar mensajes
          </button>
        </form>

        <button
          type="button"
          onClick={handleApplyCatalog}
          disabled={isPending || !projectId}
          className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 justify-center")}
        >
          {isCatalogPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          Crear catálogo desde plantilla
        </button>

        <button
          type="button"
          onClick={handleApplyProfile}
          disabled={isPending || !projectId}
          className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 justify-center")}
        >
          {isProfilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Usar como contenido de perfil
        </button>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
        Cada botón te lleva directo al resultado creado para revisarlo y editarlo.
      </p>
    </div>
  )
}
