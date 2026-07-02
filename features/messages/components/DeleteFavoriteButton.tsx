"use client"

import { useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteMessageFavoriteAction } from "../actions/favorites.actions"

interface DeleteFavoriteButtonProps {
  id: string
}

export function DeleteFavoriteButton({ id }: DeleteFavoriteButtonProps) {
  const [isPending, start] = useTransition()

  function handleDelete() {
    start(async () => {
      await deleteMessageFavoriteAction(id)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar de guardados"
      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  )
}
