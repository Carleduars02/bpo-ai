"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { catalogItemSchema, type CatalogItemFormValues } from "../schemas/catalog.schema"
import { createCatalogItemAction, updateCatalogItemAction, generateCatalogItemContentAction } from "../actions/catalog.actions"
import { searchStockImagesAction, type StockImageResult, type ImageSource } from "../actions/image-search.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2, Save, ArrowLeft, Sparkles, ImageIcon, Search } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface CatalogItemFormProps {
  mode: "create" | "edit"
  catalogId: string
  itemId?: string
  defaultValues?: Partial<CatalogItemFormValues>
}

const CURRENCIES = [
  { value: "USD", label: "USD $" },
  { value: "EUR", label: "EUR €" },
  { value: "MXN", label: "MXN $" },
  { value: "COP", label: "COP $" },
  { value: "ARS", label: "ARS $" },
  { value: "CLP", label: "CLP $" },
  { value: "PEN", label: "PEN S/" },
]

const ITEM_STATUSES = [
  { value: "active", label: "Activo" },
  { value: "draft",  label: "Borrador" },
]

export function CatalogItemForm({ mode, catalogId, itemId, defaultValues }: CatalogItemFormProps) {
  const [isPending,       startTransition]       = useTransition()
  const [isGenerating,    startGenerating]        = useTransition()
  const [isSearchingImg,  startImageSearch]       = useTransition()
  const [serverError,     setServerError]         = useState<string | null>(null)
  const [aiGenerated,     setAiGenerated]         = useState(false)
  const [imageResults,    setImageResults]        = useState<StockImageResult[] | null>(null)
  const [imageSearchError, setImageSearchError]   = useState<string | null>(null)
  const [imageSource,     setImageSource]         = useState<ImageSource>("pexels")
  const [imagePage,       setImagePage]           = useState(1)
  const [isLoadingMoreImg, startLoadMoreImg]       = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemSchema) as unknown as Resolver<CatalogItemFormValues>,
    defaultValues: {
      currency: "USD",
      status:   "active",
      ...defaultValues,
    },
  })

  const statusValue   = watch("status")
  const currencyValue = watch("currency")

  function handleGenerate() {
    const name     = watch("name")
    const context  = watch("ai_context") ?? ""
    const category = watch("category") ?? ""

    if (!name.trim()) {
      setServerError("Ingresa el nombre del producto antes de generar con IA.")
      return
    }

    setServerError(null)
    startGenerating(async () => {
      const result = await generateCatalogItemContentAction(name, context, category)
      if ("error" in result) {
        setServerError(result.error)
        return
      }
      setValue("description", result.description)
      setValue("benefits",    result.benefits.join("\n"))
      setValue("cta",         result.cta)
      setValue("keywords",    result.keywords.join(", "))
      setAiGenerated(true)
    })
  }

  function handleSearchImage() {
    const name     = watch("name")
    const category = watch("category") ?? ""

    if (!name.trim()) {
      setImageSearchError("Ingresa el nombre del producto antes de buscar una imagen.")
      return
    }

    setImageSearchError(null)
    setImageResults(null)
    setImagePage(1)
    const query = [name, category].filter(Boolean).join(" ")
    startImageSearch(async () => {
      const result = await searchStockImagesAction(query, imageSource, 1)
      if ("error" in result) {
        setImageSearchError(result.error)
        return
      }
      setImageResults(result.images)
    })
  }

  function handleLoadMoreImages() {
    const name     = watch("name")
    const category = watch("category") ?? ""
    const query = [name, category].filter(Boolean).join(" ")
    const nextPage = imagePage + 1
    setImageSearchError(null)
    startLoadMoreImg(async () => {
      const result = await searchStockImagesAction(query, imageSource, nextPage)
      if ("error" in result) {
        setImageSearchError(result.error)
        return
      }
      setImagePage(nextPage)
      setImageResults((prev) => [...(prev ?? []), ...result.images])
    })
  }

  function selectImage(url: string) {
    setValue("image_url", url, { shouldValidate: true })
    setImageResults(null)
  }

  function onSubmit(data: CatalogItemFormValues) {
    setServerError(null)
    startTransition(async () => {
      if (mode === "create") {
        const result = await createCatalogItemAction(catalogId, data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace(`/catalog/${catalogId}?item_added=1`)
        }
      } else if (itemId) {
        const result = await updateCatalogItemAction(itemId, catalogId, data)
        if ("error" in result) {
          setServerError(result.error)
        } else {
          window.location.replace(`/catalog/${catalogId}?item_updated=1`)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Identificación */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Identificación
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del producto/servicio *" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Ej: Corte de cabello + barba"
              className={cn(errors.name && "border-red-500")}
            />
          </Field>

          <Field label="Categoría" error={errors.category?.message}>
            <Input
              {...register("category")}
              placeholder="Ej: Servicios, Combos, Promociones…"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio" error={errors.price?.message}>
            <Input
              {...register("price")}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </Field>

          <Field label="Moneda" error={errors.currency?.message}>
            <Select
              value={currencyValue}
              onValueChange={(v) => v && setValue("currency", v as string)}
            >
              <SelectTrigger>
                <SelectValue>
                  {CURRENCIES.find((c) => c.value === currencyValue)?.label ?? "USD $"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Estado" error={errors.status?.message}>
            <Select
              value={statusValue}
              onValueChange={(v) => v && setValue("status", v as CatalogItemFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue>
                  {ITEM_STATUSES.find((s) => s.value === statusValue)?.label ?? "Activo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ITEM_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="URL de imagen" error={errors.image_url?.message}>
          <div className="flex gap-2">
            <Input
              {...register("image_url")}
              type="url"
              placeholder="https://… o búscala con IA"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearchImage}
              disabled={isSearchingImg}
              className="shrink-0"
            >
              {isSearchingImg ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="mr-2 h-3.5 w-3.5" />
              )}
              Buscar con IA
            </Button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 w-fit">
            <button
              type="button"
              onClick={() => setImageSource("pexels")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                imageSource === "pexels" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pexels
            </button>
            <button
              type="button"
              onClick={() => setImageSource("freepik")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                imageSource === "freepik" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Freepik (premium)
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {imageSource === "freepik"
              ? "Busca en el catálogo premium de Freepik con tu cuenta."
              : "Busca imágenes libres de derechos de autor (Pexels) según el nombre y categoría del producto."}
          </p>

          {imageSearchError && (
            <p className="text-xs text-red-400">{imageSearchError}</p>
          )}

          {watch("image_url") && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL remota arbitraria, next/image requiere dominios configurados */}
              <img
                src={watch("image_url")}
                alt="Vista previa"
                className="h-14 w-14 rounded object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <span className="truncate text-xs text-muted-foreground">{watch("image_url")}</span>
            </div>
          )}

          {imageResults && imageResults.length > 0 && (
            <>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {imageResults.map((img, i) => (
                  <button
                    key={`${img.id}-${i}`}
                    type="button"
                    onClick={() => selectImage(img.medium_url)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary"
                    title={`Foto de ${img.photographer} en ${img.source === "freepik" ? "Freepik" : "Pexels"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails de stock externos */}
                    <img src={img.thumb_url} alt={img.alt} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                      <ImageIcon className="h-4 w-4 text-white" />
                    </span>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadMoreImages}
                disabled={isLoadingMoreImg}
                className="mt-2 w-full"
              >
                {isLoadingMoreImg ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-3.5 w-3.5" />
                )}
                ¿No te convencen? Ver otra ronda de imágenes
              </Button>
            </>
          )}
        </Field>
      </section>

      <Divider />

      {/* Generación con IA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Contenido
            {aiGenerated && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                Generado con IA
              </span>
            )}
          </h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-3.5 w-3.5" />
            )}
            {isGenerating ? "Generando…" : "Generar con IA"}
          </Button>
        </div>

        <Field label="Contexto para IA (opcional)" error={errors.ai_context?.message}>
          <Input
            {...register("ai_context")}
            placeholder="Breve descripción que ayude a la IA a entender el producto…"
          />
        </Field>

        <Field label="Descripción (WhatsApp, máx. 500 chars)" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            placeholder="Descripción optimizada para el catálogo de WhatsApp Business…"
            rows={3}
            maxLength={500}
          />
        </Field>

        <Field label="Beneficios (uno por línea)" error={errors.benefits?.message}>
          <Textarea
            {...register("benefits")}
            placeholder={"Envío a domicilio incluido\nGarantía de 30 días\nAtención personalizada"}
            rows={4}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Llamada a la acción (CTA)" error={errors.cta?.message}>
            <Input
              {...register("cta")}
              placeholder="Ej: Escríbenos para reservar"
              maxLength={60}
            />
          </Field>

          <Field label="Palabras clave (separadas por coma)" error={errors.keywords?.message}>
            <Input
              {...register("keywords")}
              placeholder="Ej: corte, barba, estilismo, hombre"
            />
          </Field>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link
          href={`/catalog/${catalogId}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Link>

        <Button type="submit" disabled={isPending || isGenerating}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === "create" ? "Agregar producto" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

function Divider() {
  return <hr className="border-border" />
}
