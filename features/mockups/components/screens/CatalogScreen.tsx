import { ArrowLeft, ShoppingCart, Link2, Package, Plus } from "lucide-react"
import { WA } from "../waStyles"

interface CatalogScreenItem {
  name:      string
  price?:    number | null
  currency?: string | null
  imageUrl?: string | null
}

interface CatalogScreenProps {
  businessName: string
  coverUrl?:    string | null
  items:        CatalogScreenItem[]
}

export function CatalogScreen({ businessName, coverUrl, items }: CatalogScreenProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: WA.divider }}>
        <div className="flex items-center gap-3">
          <ArrowLeft className="h-4 w-4" style={{ color: WA.headerIcon }} />
          <p className="text-base font-medium" style={{ color: WA.textPrimary }}>Catálogo</p>
        </div>
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-4 w-4" style={{ color: WA.headerIcon }} />
          <Link2 className="h-4 w-4" style={{ color: WA.headerIcon }} />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Cover */}
        <div className="relative flex h-24 items-center justify-center overflow-hidden bg-[#111b21] px-3 text-center">
          {coverUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coverUrl} alt={businessName} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-white/40" />
          <p className="relative text-sm font-semibold" style={{ color: WA.textPrimary }}>{businessName}</p>
        </div>

        {/* Items */}
        <div className="divide-y" style={{ borderColor: WA.divider }}>
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ borderColor: WA.divider }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ backgroundColor: WA.chatBg }}>
                {item.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5" style={{ color: WA.textMuted }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm" style={{ color: WA.textPrimary }}>{item.name}</p>
                {item.price != null && (
                  <p className="text-xs" style={{ color: WA.textSecondary }}>{item.currency ?? "USD"} {item.price}</p>
                )}
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: WA.divider }}>
                <Plus className="h-3.5 w-3.5" style={{ color: WA.textPrimary }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
          <div className="rounded-full px-6 py-2 text-sm font-medium text-white" style={{ backgroundColor: WA.brandGreen }}>
            Mensaje
          </div>
        </div>
      </div>
    </div>
  )
}
