"use client"

import { useState, useTransition } from "react"
import { Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveMessageFavoriteAction, type FavoriteCategory } from "../actions/favorites.actions"

interface SaveFavoriteButtonProps {
  projectId: string
  category:  FavoriteCategory
  label?:    string | null
  text:      string
  className?: string
}

export function SaveFavoriteButton({ projectId, category, label, text, className }: SaveFavoriteButtonProps) {
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState(false)
  const [isPending, start]  = useTransition()

  function handleSave() {
    if (saved || isPending) return
    setError(false)
    start(async () => {
      const result = await saveMessageFavoriteAction(projectId, category, label ?? null, text)
      if ("error" in result) {
        setError(true)
        return
      }
      setSaved(true)
    })
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isPending || saved}
      title={saved ? "Guardado en Favoritos" : error ? "Error al guardar" : "Guardar este mensaje"}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        saved
          ? "bg-yellow-500/15 text-yellow-400"
          : error
          ? "bg-red-500/15 text-red-400"
          : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Star className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      )}
      <span className="sr-only">{saved ? "Guardado" : error ? "Error" : "Guardar"}</span>
    </button>
  )
}
