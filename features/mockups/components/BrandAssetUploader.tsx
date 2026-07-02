"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { saveMediaAction } from "@/features/images/actions/image.actions"
import { searchStockImagesAction, type StockImageResult, type ImageSource } from "@/features/catalogs/actions/image-search.actions"
import { Loader2, User, Image as ImageIcon, Pencil, Search, Upload, Link2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type AssetType = "profile" | "cover"

interface BrandAssetUploaderProps {
  projectId:    string
  userId:       string
  businessName: string
  avatarUrl?:   string | null
  coverUrl?:    string | null
}

export function BrandAssetUploader({ projectId, userId, businessName, avatarUrl, coverUrl }: BrandAssetUploaderProps) {
  const router = useRouter()
  const [saving, setSaving] = useState<AssetType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchSlot, setSearchSlot] = useState<AssetType | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef   = useRef<HTMLInputElement>(null)

  async function saveAsset(assetType: AssetType, input: { file: File } | { url: string }) {
    setSaving(assetType)
    setError(null)
    try {
      let original_url: string
      let file_name: string
      let file_size: number | undefined
      let mime_type: string | undefined

      if ("file" in input) {
        const supabase = createClient()
        const ext  = input.file.name.split(".").pop() ?? "jpg"
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, input.file, { upsert: false, contentType: input.file.type })
        if (uploadError) throw new Error(uploadError.message)
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path)
        original_url = urlData.publicUrl
        file_name    = input.file.name
        file_size    = input.file.size
        mime_type    = input.file.type
      } else {
        original_url = input.url
        file_name    = `${assetType}-${Date.now()}.jpg`
      }

      const result = await saveMediaAction({
        file_name,
        original_url,
        file_size,
        mime_type,
        media_type: assetType,
        project_id: projectId,
      })
      if ("error" in result) throw new Error(result.error)

      setSearchSlot(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la imagen")
    } finally {
      setSaving(null)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>, assetType: AssetType) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.")
    } else {
      saveAsset(assetType, { file })
    }
    e.target.value = ""
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Imágenes de marca del proyecto</h3>
        <p className="text-xs text-muted-foreground">
          Súbelas o búscalas una vez y se usan automáticamente en todos los mockups de este proyecto.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <AssetSlot
          label="Foto de perfil"
          shape="circle"
          icon={User}
          url={avatarUrl}
          saving={saving === "profile"}
          onPickFile={() => profileInputRef.current?.click()}
          onSearch={() => setSearchSlot(searchSlot === "profile" ? null : "profile")}
          searchOpen={searchSlot === "profile"}
        />
        <AssetSlot
          label="Portada del catálogo"
          shape="rect"
          icon={ImageIcon}
          url={coverUrl}
          saving={saving === "cover"}
          onPickFile={() => coverInputRef.current?.click()}
          onSearch={() => setSearchSlot(searchSlot === "cover" ? null : "cover")}
          searchOpen={searchSlot === "cover"}
        />
        <input ref={profileInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFileChange(e, "profile")} />
        <input ref={coverInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFileChange(e, "cover")} />
      </div>

      {searchSlot && (
        <StockImageSearch
          defaultQuery={businessName}
          isSaving={saving === searchSlot}
          onSelect={(url) => saveAsset(searchSlot, { url })}
        />
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

function AssetSlot({
  label, shape, icon: Icon, url, saving, onPickFile, onSearch, searchOpen,
}: {
  label:      string
  shape:      "circle" | "rect"
  icon:       typeof User
  url?:       string | null
  saving:     boolean
  onPickFile: () => void
  onSearch:   () => void
  searchOpen: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPickFile}
        disabled={saving}
        className={cn(
          "group relative flex shrink-0 items-center justify-center overflow-hidden border border-border bg-background",
          shape === "circle" ? "h-16 w-16 rounded-full" : "h-16 w-24 rounded-lg"
        )}
      >
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-6 w-6 text-muted-foreground/50" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {saving ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Pencil className="h-4 w-4 text-white" />}
        </span>
      </button>
      <div>
        <p className="text-xs font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPickFile} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
            <Upload className="h-3 w-3" /> {url ? "Cambiar" : "Subir"}
          </button>
          <span className="text-[11px] text-muted-foreground/50">·</span>
          <button
            type="button"
            onClick={onSearch}
            className={cn("flex items-center gap-1 text-[11px]", searchOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Search className="h-3 w-3" /> Buscar con IA
          </button>
        </div>
      </div>
    </div>
  )
}

function StockImageSearch({
  defaultQuery, isSaving, onSelect,
}: {
  defaultQuery: string
  isSaving:     boolean
  onSelect:     (url: string) => void
}) {
  const [query, setQuery] = useState(defaultQuery)
  const [source, setSource] = useState<ImageSource>("pexels")
  const [results, setResults] = useState<StockImageResult[] | null>(null)
  const [page, setPage] = useState(1)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()
  const [isLoadingMore, startLoadMore] = useTransition()
  const [pasteUrl, setPasteUrl] = useState("")

  function handleSearch() {
    if (!query.trim()) {
      setSearchError("Escribe un término de búsqueda.")
      return
    }
    setSearchError(null)
    setResults(null)
    setPage(1)
    startSearch(async () => {
      const result = await searchStockImagesAction(query, source, 1)
      if ("error" in result) {
        setSearchError(result.error)
        return
      }
      setResults(result.images)
    })
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setSearchError(null)
    startLoadMore(async () => {
      const result = await searchStockImagesAction(query, source, nextPage)
      if ("error" in result) {
        setSearchError(result.error)
        return
      }
      setPage(nextPage)
      setResults((prev) => [...(prev ?? []), ...result.images])
    })
  }

  function handleUseUrl() {
    if (!pasteUrl.trim()) return
    onSelect(pasteUrl.trim())
    setPasteUrl("")
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. nombre del negocio, rubro..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 w-fit">
          <button
            type="button"
            onClick={() => setSource("pexels")}
            className={cn("rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors", source === "pexels" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            Pexels
          </button>
          <button
            type="button"
            onClick={() => setSource("freepik")}
            className={cn("rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors", source === "freepik" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            Freepik (premium)
          </button>
        </div>
      </div>

      {searchError && <p className="text-xs text-red-400">{searchError}</p>}

      {results && results.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {results.map((img, i) => (
              <button
                key={`${img.source}-${img.id}-${i}`}
                type="button"
                onClick={() => onSelect(img.medium_url)}
                disabled={isSaving}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                title={img.alt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumb_url} alt={img.alt} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                {isSaving && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            {isLoadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            ¿No te convencen? Ver otra ronda de imágenes
          </button>
        </>
      )}

      {/* Pegar URL directamente — por si el cliente envía una imagen propia */}
      <div className="space-y-1 border-t border-border pt-3">
        <p className="text-[11px] font-medium text-muted-foreground">¿Ya tienes una URL de imagen (te la envió el cliente)?</p>
        <div className="flex gap-2">
          <input
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://…"
            type="url"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleUseUrl}
            disabled={isSaving || !pasteUrl.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40 disabled:opacity-40"
          >
            <Link2 className="h-3.5 w-3.5" />
            Usar URL
          </button>
        </div>
      </div>
    </div>
  )
}
