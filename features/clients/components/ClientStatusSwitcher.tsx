"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { updateClientStatusAction } from "../actions/client.actions"

type ClientStatus = "active" | "potential" | "archived"

const STATUS_CONFIG: Record<ClientStatus, { label: string; badgeClass: string; dotClass: string }> = {
  active: {
    label: "Activo",
    badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
    dotClass: "bg-green-400",
  },
  potential: {
    label: "Potencial",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dotClass: "bg-blue-400",
  },
  archived: {
    label: "Archivado",
    badgeClass: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    dotClass: "bg-zinc-400",
  },
}

interface ClientStatusSwitcherProps {
  clientId: string
  status: string
}

export function ClientStatusSwitcher({ clientId, status }: ClientStatusSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const current = STATUS_CONFIG[status as ClientStatus] ?? STATUS_CONFIG.active

  function handleSelect(next: ClientStatus) {
    if (next === status || isPending) return
    startTransition(async () => {
      const result = await updateClientStatusAction(clientId, next)
      if (!("error" in result)) {
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="outline-none"
        render={
          <button
            type="button"
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
              current.badgeClass
            )}
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : current.label}
            <ChevronDown className="h-3 w-3" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-44">
        {(Object.keys(STATUS_CONFIG) as ClientStatus[]).map((key) => (
          <DropdownMenuItem key={key} onClick={() => handleSelect(key)}>
            <span className={cn("mr-2 h-2 w-2 shrink-0 rounded-full", STATUS_CONFIG[key].dotClass)} />
            {STATUS_CONFIG[key].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
