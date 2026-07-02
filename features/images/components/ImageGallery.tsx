"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Trash2, ImageIcon } from "lucide-react"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { deleteMediaAction } from "../actions/image.actions"

interface MediaRecord {
  id:           string
  file_name:    string
  original_url: string
  file_size:    number | null
  mime_type:    string | null
  width:        number | null
  height:       number | null
  media_type:   string
  created_at:   string
  projects:     { id: string; name: string } | null
  clients:      { business_name: string } | null
}

interface ImageGalleryProps {
  images:      MediaRecord[]
  view:        ViewMode
  hasFilters?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  logo:    "Logo",
  cover:   "Portada",
  product: "Producto",
  profile: "Perfil",
  other:   "Otro",
}

const TYPE_COLORS: Record<string, string> = {
  logo:    "border-purple-500/30 bg-purple-500/10 text-purple-400",
  cover:   "border-blue-500/30 bg-blue-500/10 text-blue-400",
  product: "border-green-500/30 bg-green-500/10 text-green-400",
  profile: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  other:   "border-border bg-muted/30 text-muted-foreground",
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function ownerLabel(img: MediaRecord): string | null {
  return img.clients?.business_name ?? img.projects?.name ?? null
}

export function ImageGallery({ images, view, hasFilters }: ImageGalleryProps) {
  const router = useRouter()
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [failedImgs, setFailedImgs] = useState<Set<string>>(new Set())

  async function handleDelete(id: string) {
    if (deleting) return
    setDeleting(id)
    await deleteMediaAction(id)
    setDeleting(null)
    router.refresh()
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">{hasFilters ? "Sin resultados" : "Sin imágenes todavía"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasFilters
            ? "No hay imágenes que coincidan con tu búsqueda o filtros."
            : "Sube fotos de logotipos, productos y perfiles de tus clientes."}
        </p>
      </div>
    )
  }

  function Thumb({ img, className }: { img: MediaRecord; className: string }) {
    return failedImgs.has(img.id) ? (
      <div className={`flex items-center justify-center bg-muted/20 ${className}`}>
        <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
      </div>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img.original_url}
        alt={img.file_name}
        className={`object-cover ${className}`}
        onError={() => setFailedImgs((prev) => new Set([...prev, img.id]))}
      />
    )
  }

  function Actions({ img }: { img: MediaRecord }) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={img.original_url}
          download={img.file_name}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Descargar"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={() => handleDelete(img.id)}
          disabled={deleting === img.id}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  if (view === "table") {
    return (
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_auto] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span />
            <span>Nombre</span>
            <span>Tipo</span>
            <span>Cliente / Proyecto</span>
            <span>Tamaño</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {images.map((img) => (
              <div key={img.id} className="grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm">
                <Thumb img={img} className="h-9 w-9 rounded-md" />
                <span className="truncate" title={img.file_name}>{img.file_name}</span>
                <span className={`w-fit rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[img.media_type] ?? TYPE_COLORS.other}`}>
                  {TYPE_LABELS[img.media_type] ?? img.media_type}
                </span>
                <span className="truncate text-xs text-muted-foreground">{ownerLabel(img) ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{formatSize(img.file_size)}</span>
                <Actions img={img} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (view === "list") {
    return (
      <div className="space-y-2">
        {images.map((img) => (
          <div key={img.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Thumb img={img} className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={img.file_name}>{img.file_name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[img.media_type] ?? TYPE_COLORS.other}`}>
                  {TYPE_LABELS[img.media_type] ?? img.media_type}
                </span>
                {ownerLabel(img) && (
                  <span className="truncate text-[11px] text-muted-foreground">{ownerLabel(img)}</span>
                )}
                {img.file_size && (
                  <span className="text-[11px] text-muted-foreground/70">{formatSize(img.file_size)}</span>
                )}
              </div>
            </div>
            <Actions img={img} />
          </div>
        ))}
      </div>
    )
  }

  // grid (default)
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((img) => (
        <div key={img.id} className="group relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-square bg-muted/20">
            <Thumb img={img} className="h-full w-full transition-transform duration-200 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                href={img.original_url}
                download={img.file_name}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                title="Descargar"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deleting === img.id}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/70 text-white backdrop-blur-sm hover:bg-red-500/90 disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1 p-2">
            <div className="flex items-center justify-between gap-1">
              <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[img.media_type] ?? TYPE_COLORS.other}`}>
                {TYPE_LABELS[img.media_type] ?? img.media_type}
              </span>
              {img.file_size && (
                <span className="text-[10px] text-muted-foreground">{formatSize(img.file_size)}</span>
              )}
            </div>
            <p className="truncate text-[11px] text-muted-foreground" title={img.file_name}>
              {img.file_name}
            </p>
            {ownerLabel(img) && (
              <p className="truncate text-[10px] text-muted-foreground/60">{ownerLabel(img)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
