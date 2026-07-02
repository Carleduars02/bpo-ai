"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { bulkCreateCatalogItemsAction, generateBulkItemContentAction, type BulkItemInput } from "../actions/bulk.actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FileSpreadsheet, List, Upload, Sparkles, Loader2,
  Trash2, Plus, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react"

interface BulkImporterProps {
  catalogId:   string
  catalogName: string
}

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS", "CLP", "PEN"]
const DEFAULT_CURRENCY = "USD"

interface RowItem extends BulkItemInput {
  _key:        number
  _generating: boolean
  _generated:  boolean
  _error?:     string
}

function parseTextList(raw: string): BulkItemInput[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim())
      const name     = parts[0] ?? ""
      const price    = parts[1] ? parseFloat(parts[1].replace(/[^0-9.]/g, "")) : undefined
      const category = parts[2] ?? ""
      return { name, price: isNaN(price ?? NaN) ? undefined : price, category, currency: DEFAULT_CURRENCY }
    })
    .filter((i) => i.name.length > 0)
}

async function parseFile(file: File): Promise<BulkItemInput[]> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "csv") {
    const Papa = (await import("papaparse")).default
    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(file, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data.map((row) => {
            const name     = row.name ?? row.nombre ?? row.product ?? row.producto ?? ""
            const price    = row.price ?? row.precio ?? ""
            const category = row.category ?? row.categoria ?? row.category ?? ""
            const desc     = row.description ?? row.descripcion ?? ""
            return {
              name:        name.trim(),
              category:    category.trim() || undefined,
              price:       price ? parseFloat(price.replace(/[^0-9.]/g, "")) || undefined : undefined,
              description: desc.trim() || undefined,
              currency:    DEFAULT_CURRENCY,
            }
          }).filter((i) => i.name.length > 0))
        },
      })
    })
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx")
    const buffer = await file.arrayBuffer()
    const wb     = XLSX.read(buffer, { type: "array" })
    const ws     = wb.Sheets[wb.SheetNames[0]]
    const data   = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })
    return data.map((row) => {
      const name     = String(row.name ?? row.nombre ?? row.producto ?? row.product ?? "")
      const price    = String(row.price ?? row.precio ?? "")
      const category = String(row.category ?? row.categoria ?? "")
      const desc     = String(row.description ?? row.descripcion ?? "")
      return {
        name:        name.trim(),
        category:    category.trim() || undefined,
        price:       price ? parseFloat(price.replace(/[^0-9.]/g, "")) || undefined : undefined,
        description: desc.trim() || undefined,
        currency:    DEFAULT_CURRENCY,
      }
    }).filter((i) => i.name.length > 0)
  }

  return []
}

export function BulkImporter({ catalogId }: BulkImporterProps) {
  const router              = useRouter()
  const [tab, setTab]       = useState<"text" | "file">("text")
  const [rawText, setRawText] = useState("")
  const [rows, setRows]     = useState<RowItem[]>([])
  const [saving, startSave] = useTransition()
  const [saveResult, setSaveResult] = useState<{ kind: "success" | "error"; text: string } | null>(null)
  const [fileError, setFileError]   = useState("")
  const [currency, setCurrency]     = useState(DEFAULT_CURRENCY)
  const fileRef = useRef<HTMLInputElement>(null)
  const nextKey = useRef(0)

  function makeRow(item: BulkItemInput): RowItem {
    return { ...item, currency: item.currency || currency, _key: nextKey.current++, _generating: false, _generated: false }
  }

  function loadFromText() {
    const parsed = parseTextList(rawText)
    if (!parsed.length) return
    setRows(parsed.map(makeRow))
    setSaveResult(null)
  }

  async function loadFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError("")
    const parsed = await parseFile(file)
    if (!parsed.length) { setFileError("No se encontraron productos en el archivo."); return }
    setRows(parsed.map(makeRow))
    setSaveResult(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  function updateRow(key: number, field: keyof BulkItemInput, value: string | number | undefined) {
    setRows((prev) => prev.map((r) => r._key === key ? { ...r, [field]: value } : r))
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r._key !== key))
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow({ name: "", currency })])
  }

  async function generateForRow(key: number) {
    const row = rows.find((r) => r._key === key)
    if (!row || !row.name.trim()) return

    setRows((prev) => prev.map((r) => r._key === key ? { ...r, _generating: true, _error: undefined } : r))

    const result = await generateBulkItemContentAction(row.name, row.category ?? "", "")

    setRows((prev) => prev.map((r) => {
      if (r._key !== key) return r
      if ("error" in result) return { ...r, _generating: false, _error: result.error }
      return {
        ...r,
        description: result.description,
        _generating: false,
        _generated:  true,
      }
    }))
  }

  async function generateAll() {
    const pending = rows.filter((r) => r.name.trim() && !r._generated)
    for (const row of pending) {
      await generateForRow(row._key)
    }
  }

  function handleSave() {
    setSaveResult(null)
    startSave(async () => {
      const items = rows.filter((r) => r.name.trim()).map((r) => ({
        name:        r.name,
        category:    r.category,
        price:       r.price,
        currency:    r.currency || currency,
        description: r.description,
      }))
      const result = await bulkCreateCatalogItemsAction(catalogId, items)
      if ("error" in result) {
        setSaveResult({ kind: "error", text: result.error })
      } else {
        setSaveResult({ kind: "success", text: `${result.count} producto${result.count !== 1 ? "s" : ""} importado${result.count !== 1 ? "s" : ""} correctamente.` })
        setTimeout(() => router.push(`/catalog/${catalogId}?item_added=1`), 1200)
      }
    })
  }

  const hasRows    = rows.length > 0
  const validCount = rows.filter((r) => r.name.trim()).length

  return (
    <div className="space-y-6">
      {/* Formato de referencia */}
      <div className="rounded-xl border border-border bg-card/50 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Formato para lista de texto:</p>
        <p className="font-mono">Nombre del producto | precio | categoría</p>
        <p className="font-mono text-muted-foreground/70">Ej: Corte de cabello | 15 | Servicios</p>
        <p className="mt-1">Para CSV/Excel: columnas <span className="font-mono">name, price, category, description</span> (también acepta en español).</p>
      </div>

      {/* Moneda global */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium shrink-0">Moneda para todos los productos:</label>
        <select
          value={currency}
          onChange={(e) => { setCurrency(e.target.value); setRows((p) => p.map((r) => ({ ...r, currency: e.target.value }))) }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["text", "file"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
              tab === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {t === "text" ? <List className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
            {t === "text" ? "Lista de texto" : "CSV / Excel"}
          </button>
        ))}
      </div>

      {/* Input panel */}
      {tab === "text" ? (
        <div className="space-y-3">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            placeholder={"Corte de cabello | 15 | Servicios\nAfeitado clásico | 10 | Servicios\nTratamiento capilar | 25 | Tratamientos\nArreglo de barba | 8"}
            className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="button" onClick={loadFromText} disabled={!rawText.trim()} variant="outline">
            <ChevronDown className="mr-2 h-4 w-4" />
            Cargar lista
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-10 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Upload className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">Haz clic para seleccionar un archivo</p>
            <p className="text-xs text-muted-foreground">.csv, .xlsx, .xls</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={loadFromFile} className="sr-only" />
          </div>
          {fileError && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> {fileError}
            </p>
          )}
        </div>
      )}

      {/* Review table */}
      {hasRows && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {rows.length} producto{rows.length !== 1 ? "s" : ""} detectado{rows.length !== 1 ? "s" : ""}
              <span className="ml-2 text-xs font-normal text-muted-foreground">Revisa y ajusta antes de guardar</span>
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={generateAll}>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Generar descripción con IA (todos)
            </Button>
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <BulkRow
                key={row._key}
                row={row}
                currency={currency}
                onUpdate={(field, value) => updateRow(row._key, field, value)}
                onRemove={() => removeRow(row._key)}
                onGenerate={() => generateForRow(row._key)}
              />
            ))}
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Agregar fila
          </Button>

          {saveResult && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              saveResult.kind === "success"
                ? "border-green-500/30 bg-green-500/5 text-green-400"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            )}>
              {saveResult.kind === "success"
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <AlertCircle className="h-4 w-4 shrink-0" />}
              {saveResult.text}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || validCount === 0}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronUp className="mr-2 h-4 w-4" />}
              {saving ? "Guardando…" : `Guardar ${validCount} producto${validCount !== 1 ? "s" : ""}`}
            </Button>
            <button type="button" onClick={() => setRows([])} className="text-xs text-muted-foreground hover:text-foreground">
              Limpiar lista
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BulkRow({
  row, currency, onUpdate, onRemove, onGenerate,
}: {
  row:        RowItem
  currency:   string
  onUpdate:   (field: keyof BulkItemInput, value: string | number | undefined) => void
  onRemove:   () => void
  onGenerate: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn(
      "rounded-xl border bg-card transition-colors",
      row._generated ? "border-primary/30" : "border-border"
    )}>
      {/* Main row */}
      <div className="flex items-center gap-2 p-3">
        <input
          value={row.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Nombre del producto *"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={row.price ?? ""}
          type="number"
          min="0"
          step="0.01"
          onChange={(e) => onUpdate("price", e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Precio"
          className="w-24 rounded-lg border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground">{currency}</span>
        <input
          value={row.category ?? ""}
          onChange={(e) => onUpdate("category", e.target.value || undefined)}
          placeholder="Categoría"
          className="w-28 rounded-lg border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={row._generating || !row.name.trim()}
          title="Generar descripción con IA"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
            row._generated
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {row._generating
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Sparkles className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          title="Expandir descripción"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500/30 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded description */}
      {(expanded || row._generated) && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-1.5">
          {row._error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {row._error}
            </p>
          )}
          <textarea
            value={row.description ?? ""}
            onChange={(e) => onUpdate("description", e.target.value || undefined)}
            rows={2}
            placeholder="Descripción para WhatsApp (opcional) — puedes generarla con IA ✦"
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {row._generated && (
            <p className="text-[10px] text-primary/70 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Generado con IA
            </p>
          )}
        </div>
      )}
    </div>
  )
}
