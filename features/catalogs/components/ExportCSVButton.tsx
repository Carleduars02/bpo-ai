"use client"

import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { exportCatalogToWhatsAppCSVAction } from "@/features/catalogs/actions/bulk.actions"

interface ExportCSVButtonProps {
  catalogId: string
}

export function ExportCSVButton({ catalogId }: ExportCSVButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      const result = await exportCatalogToWhatsAppCSVAction(catalogId)
      if ("error" in result) {
        setError(result.error)
        return
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError("Error inesperado al exportar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {loading ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-3.5 w-3.5" />
        )}
        Exportar CSV
      </button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
