"use client"

import { useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { saveMediaAction } from "../actions/image.actions"
import { buttonVariants } from "@/components/ui/button"
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Project {
  id:      string
  name:    string
  clients: { business_name: string } | null
}

interface ImageUploaderProps {
  projects: Project[]
  userId:   string
}

const MEDIA_TYPES = [
  { value: "product", label: "Producto" },
  { value: "profile", label: "Foto de perfil" },
  { value: "logo",    label: "Logo" },
  { value: "cover",   label: "Portada" },
  { value: "other",   label: "Otro" },
] as const

type MediaType = (typeof MEDIA_TYPES)[number]["value"]

interface FilePreview {
  file:       File
  previewUrl: string
  width?:     number
  height?:    number
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

export function ImageUploader({ projects, userId }: ImageUploaderProps) {
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging]     = useState(false)
  const [preview,    setPreview]        = useState<FilePreview | null>(null)
  const [mediaType,  setMediaType]      = useState<MediaType>("product")
  const [projectId,  setProjectId]      = useState("")
  const [status,     setStatus]         = useState<UploadStatus>("idle")
  const [errorMsg,   setErrorMsg]       = useState("")

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Solo se aceptan imágenes (JPG, PNG, WEBP, GIF).")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("El archivo no puede superar 10 MB.")
      return
    }
    setErrorMsg("")

    const url = URL.createObjectURL(file)
    const img  = new Image()
    img.onload = () => {
      setPreview({ file, previewUrl: url, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = url
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview.previewUrl)
    setPreview(null)
    setStatus("idle")
    setErrorMsg("")
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleUpload() {
    if (!preview) return
    setStatus("uploading")
    setErrorMsg("")

    try {
      const supabase  = createClient()
      const ext       = preview.file.name.split(".").pop() ?? "jpg"
      const timestamp = Date.now()
      const path      = `${userId}/${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, preview.file, { upsert: false, contentType: preview.file.type })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path)

      const result = await saveMediaAction({
        file_name:    preview.file.name,
        original_url: urlData.publicUrl,
        file_size:    preview.file.size,
        mime_type:    preview.file.type,
        width:        preview.width,
        height:       preview.height,
        media_type:   mediaType,
        project_id:   projectId || undefined,
      })

      if ("error" in result) throw new Error(result.error)

      setStatus("success")
      setTimeout(() => {
        clearPreview()
        router.refresh()
      }, 1200)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir la imagen"
      setErrorMsg(msg)
      setStatus("error")
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Subir imagen
      </h2>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Arrastra una imagen aquí</p>
            <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
            <p className="mt-1 text-xs text-muted-foreground/60">JPG, PNG, WEBP · Máx. 10 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted/20">
            <button
              onClick={clearPreview}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.previewUrl}
              alt={preview.file.name}
              className="max-h-48 w-full object-contain"
            />
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="truncate font-medium text-foreground">{preview.file.name}</p>
            <p>
              {(preview.file.size / 1024).toFixed(0)} KB
              {preview.width && preview.height && ` · ${preview.width}×${preview.height}px`}
            </p>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tipo de imagen</label>
            <div className="flex flex-wrap gap-2">
              {MEDIA_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setMediaType(mt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    mediaType === mt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          {projects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Proyecto asociado
                <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clients?.business_name ?? p.name} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={status === "uploading" || status === "success"}
            className={cn(buttonVariants({ size: "sm" }), "w-full gap-2")}
          >
            {status === "uploading" && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Subiendo...</>}
            {status === "success"   && <><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> ¡Subida!</>}
            {(status === "idle" || status === "error") && <><Upload className="h-3.5 w-3.5" /> Subir imagen</>}
          </button>
        </div>
      )}

      {errorMsg && !preview && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}
