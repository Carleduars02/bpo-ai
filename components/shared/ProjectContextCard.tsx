import { Building2, MapPin, Globe, Package, Tag } from "lucide-react"
import { SECTORS } from "@/constants/navigation"

export interface ProjectContextClient {
  business_name: string
  sector?:       string | null
  city?:         string | null
  description?:  string | null
  website?:      string | null
}

interface ProjectContextCardProps {
  client:           ProjectContextClient
  catalogItemCount?: number
}

export function ProjectContextCard({ client, catalogItemCount }: ProjectContextCardProps) {
  const sectorLabel = SECTORS.find((s) => s.value === client.sector)?.label ?? client.sector

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-semibold">{client.business_name}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sectorLabel && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
            <Tag className="h-3 w-3" /> {sectorLabel}
          </span>
        )}
        {client.city && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {client.city}
          </span>
        )}
        {client.website && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
            <Globe className="h-3 w-3" /> Sitio web
          </span>
        )}
        {typeof catalogItemCount === "number" && catalogItemCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] text-primary">
            <Package className="h-3 w-3" /> {catalogItemCount} producto{catalogItemCount !== 1 ? "s" : ""} en catálogo
          </span>
        )}
      </div>

      {client.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{client.description}</p>
      )}

      <p className="text-[10px] text-muted-foreground/60">
        Estos datos ya registrados se usan automáticamente para personalizar la generación con IA.
      </p>
    </div>
  )
}
