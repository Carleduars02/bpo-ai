"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleMessagePinAction } from "../actions/message.actions"

interface PinButtonProps {
  contentId: string
  itemKey:   string
  pinned:    boolean
  className?: string
}

export function PinButton({ contentId, itemKey, pinned, className }: PinButtonProps) {
  const router = useRouter()
  const [isPending, start] = useTransition()
  const [error, setError]  = useState(false)

  function handleToggle() {
    setError(false)
    start(async () => {
      const result = await toggleMessagePinAction(contentId, itemKey, !pinned)
      if ("error" in result) {
        setError(true)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={pinned ? "Quitar de fijados" : "Fijar este mensaje"}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        pinned
          ? "bg-primary/15 text-primary"
          : error
          ? "bg-red-500/15 text-red-400"
          : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
      )}
      <span className="sr-only">{pinned ? "Fijado" : error ? "Error" : "Fijar"}</span>
    </button>
  )
}
