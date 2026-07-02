"use client"

import { useActionState } from "react"
import { updateProfileAction } from "../actions/settings.actions"
import { buttonVariants } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileFormProps {
  fullName: string
  company:  string
}

type ActionState = { error: string } | { success: true } | null

export function ProfileForm({ fullName, company }: ProfileFormProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    updateProfileAction,
    null
  )

  return (
    <form action={action} className="space-y-4">
      {state && "error" in state && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Cambios guardados correctamente.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="full_name">
          Nombre completo <span className="text-red-400">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          maxLength={100}
          defaultValue={fullName}
          placeholder="Tu nombre y apellido"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Se usa como nombre del consultor en los reportes PDF.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="company">
          Nombre del negocio / marca
          <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          maxLength={100}
          defaultValue={company}
          placeholder="Ej. BPO Consulting, Tu Marca Digital..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(buttonVariants(), "gap-2")}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </div>
    </form>
  )
}
