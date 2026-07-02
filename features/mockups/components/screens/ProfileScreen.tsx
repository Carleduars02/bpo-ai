import { ArrowLeft, MoreVertical, Phone, Store, Share2, Tags, MapPin, Mail, Globe, ChevronRight } from "lucide-react"
import { WA } from "../waStyles"

interface ProfileScreenProps {
  businessName: string
  description?: string | null
  sector?:      string | null
  city?:        string | null
  website?:     string | null
  phone?:       string | null
  email?:       string | null
  avatarUrl?:   string | null
  products:     { name: string; imageUrl?: string | null }[]
}

function ActionButton({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2.5" style={{ borderColor: WA.divider }}>
      <Icon className="h-4 w-4" style={{ color: WA.textPrimary }} />
      <span className="text-[11px]" style={{ color: WA.textPrimary }}>{label}</span>
    </div>
  )
}

function InfoRow({ icon: Icon, text, isLink }: { icon: typeof Tags; text: string; isLink?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: WA.divider }}>
      <Icon className="h-4 w-4 shrink-0" style={{ color: WA.textSecondary }} />
      <p className="truncate text-sm" style={{ color: isLink ? WA.linkBlue : WA.textPrimary }}>{text}</p>
    </div>
  )
}

export function ProfileScreen({ businessName, description, sector, city, website, phone, email, avatarUrl, products }: ProfileScreenProps) {
  const initial = businessName.charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: WA.divider }}>
        <ArrowLeft className="h-4 w-4" style={{ color: WA.headerIcon }} />
        <MoreVertical className="h-4 w-4" style={{ color: WA.headerIcon }} />
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-1 py-5">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt={businessName} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: WA.brandGreen }}>
              {initial}
            </div>
          )}
          <p className="mt-1 px-4 text-center text-lg font-medium" style={{ color: WA.textPrimary }}>{businessName}</p>
          {phone && <p className="text-sm" style={{ color: WA.textSecondary }}>{phone}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-4 pb-4">
          {phone && <ActionButton icon={Phone} label="Llamar" />}
          <ActionButton icon={Store} label="Catálogo" />
          <ActionButton icon={Share2} label="Compartir" />
        </div>

        {description && (
          <div className="border-t border-b px-4 py-3" style={{ borderColor: WA.divider }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: WA.textSecondary }}>Descripción</p>
            <p className="mt-1 text-sm" style={{ color: WA.textPrimary }}>{description}</p>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="border-b px-4 py-3" style={{ borderColor: WA.divider }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: WA.textPrimary }}>Productos</p>
              <span className="flex items-center gap-0.5 text-xs" style={{ color: WA.textSecondary }}>
                VER TODOS <ChevronRight className="h-3 w-3" />
              </span>
            </div>
            <div className="flex gap-2 overflow-hidden">
              {products.slice(0, 3).map((p, i) => (
                <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: WA.chatBg }}>
                  {p.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {sector && <InfoRow icon={Tags} text={sector} />}
        {city && <InfoRow icon={MapPin} text={city} />}
        {website && <InfoRow icon={Globe} text={website} isLink />}
        {email && <InfoRow icon={Mail} text={email} isLink />}
      </div>
    </div>
  )
}
