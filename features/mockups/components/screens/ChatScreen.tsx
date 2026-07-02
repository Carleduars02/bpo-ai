import { ArrowLeft, Store, Phone, ChevronDown, MoreVertical, Smile, Paperclip, Camera, Zap, Mic, CheckCheck } from "lucide-react"
import { WA, WA_CHAT_BG_PATTERN } from "../waStyles"

interface ChatScreenProps {
  businessName: string
  message:      string
  avatarUrl?:   string | null
}

export function ChatScreen({ businessName, message, avatarUrl }: ChatScreenProps) {
  const initial = businessName.charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: WA.chatBg }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-2 py-2"
        style={{ backgroundColor: WA.headerBg, borderColor: WA.divider }}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatarUrl} alt={businessName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: WA.brandGreen }}
          >
            {initial}
          </div>
        )}
        <p className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: WA.headerText }}>{businessName}</p>
        <Store className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <Phone className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <ChevronDown className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <MoreVertical className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
      </div>

      {/* Chat body */}
      <div
        className="flex-1 space-y-3 px-3 py-4"
        style={{ backgroundImage: WA_CHAT_BG_PATTERN, backgroundSize: "90px 90px, 70px 70px, 110px 110px" }}
      >
        <div
          className="mx-auto flex w-fit max-w-[90%] items-start gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] leading-snug"
          style={{ backgroundColor: WA.systemPillBg, color: WA.textPrimary }}
        >
          🔒 Los mensajes están cifrados de extremo a extremo. Solo las personas en este chat pueden leerlos.
        </div>

        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-lg px-3 py-2 shadow-sm" style={{ backgroundColor: WA.bubbleOut }}>
            <p className="text-[13px] leading-snug" style={{ color: WA.textPrimary }}>Hola</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[10px]" style={{ color: WA.textSecondary }}>
              9:29 p.m. <CheckCheck className="h-3 w-3" style={{ color: WA.linkBlue }} />
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg px-3 py-2 shadow-sm" style={{ backgroundColor: WA.bubbleIn }}>
            <p className="whitespace-pre-wrap text-[13px] leading-snug" style={{ color: WA.textPrimary }}>{message}</p>
            <p className="mt-1 text-right text-[10px]" style={{ color: WA.textSecondary }}>9:29 p.m.</p>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-2 py-2" style={{ backgroundColor: WA.headerBg }}>
        <Smile className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <div className="flex-1 rounded-full px-3 py-1.5 text-sm" style={{ backgroundColor: WA.chatBg, color: WA.textMuted }}>
          Mensaje
        </div>
        <Paperclip className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <Camera className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <Zap className="h-4 w-4 shrink-0" style={{ color: WA.headerIcon }} />
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111b21] text-white">
          <Mic className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}
