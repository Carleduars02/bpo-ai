"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
}

export function CopyButton({ text, className, label = "Copiar" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Permisos de portapapeles denegados por el navegador — no hay fallback posible
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs",
        "text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
        className
      )}
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-400" /> Copiado</>
      ) : (
        <><Copy className="h-3 w-3" /> {label}</>
      )}
    </button>
  )
}
