import { ArrowLeft, ShoppingCart, MoreVertical, Package } from "lucide-react"
import { WA } from "../waStyles"

interface CatalogItemScreenProps {
  businessName: string
  avatarUrl?:   string | null
  item: {
    name:        string
    description?: string | null
    price?:      number | null
    currency?:   string | null
    imageUrl?:   string | null
  }
}

export function CatalogItemScreen({ businessName, avatarUrl, item }: CatalogItemScreenProps) {
  const initial = businessName.charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Image with overlay icons */}
      <div className="relative h-44 shrink-0" style={{ backgroundColor: WA.chatBg }}>
        {item.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10" style={{ color: WA.textMuted }} />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent px-3 py-2.5">
          <ArrowLeft className="h-4 w-4 text-white" />
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-4 w-4 text-white" />
            <MoreVertical className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-2.5">
        <p className="text-base font-semibold" style={{ color: WA.textPrimary }}>{item.name}</p>
        {item.price != null && (
          <p className="mt-0.5 text-sm" style={{ color: WA.textPrimary }}>{item.currency ?? "USD"} {item.price}</p>
        )}
        {item.description && (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed" style={{ color: WA.textSecondary }}>{item.description}</p>
        )}

        <div className="mt-2.5 rounded-full border py-2 text-center text-xs font-medium" style={{ borderColor: WA.divider, color: WA.brandGreen }}>
          Enviar mensaje a la empresa
        </div>

        <div className="mt-2.5 border-t pt-2.5" style={{ borderColor: WA.divider }}>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide" style={{ color: WA.textSecondary }}>Info. de la empresa</p>
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarUrl} alt={businessName} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: WA.brandGreen }}>
                {initial}
              </div>
            )}
            <p className="text-xs" style={{ color: WA.textPrimary }}>{businessName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <div className="rounded-full py-2.5 text-center text-sm font-medium text-white" style={{ backgroundColor: WA.brandGreen }}>
          Añadir a la solicitud de pedido
        </div>
      </div>
    </div>
  )
}
