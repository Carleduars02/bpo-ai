import type { WelcomeMessage, QuickReply, StatusText } from "@/lib/ai/messages"
import { CopyButton } from "./CopyButton"
import { SaveFavoriteButton } from "./SaveFavoriteButton"
import { PinButton } from "./PinButton"
import { MessageSquare, Clock, Zap, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/components/shared/ViewToggle"
import type { FavoriteCategory } from "../actions/favorites.actions"

const HOVER_CARD = "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"

const STATUS_TYPE_LABELS: Record<string, string> = {
  promo:       "Promoción",
  social_proof:"Social proof",
  valor:       "Dato de valor",
  producto:    "Producto destacado",
  tip:         "Tip práctico",
  cta:         "Llamada a la acción",
  motivacional:"Motivacional",
}

interface Item {
  key:      string
  label:    string
  text:     string
  category: FavoriteCategory
  index?:   number
}

interface MessageSetResultProps {
  contentId:        string
  projectId:        string
  view:             ViewMode
  pinnedItems:      string[]
  welcome_messages: WelcomeMessage[]
  away_message:     string
  quick_replies:    QuickReply[]
  status_texts:     StatusText[]
}

function sortByPinned(items: Item[], pinnedItems: string[]): Item[] {
  return [...items].sort((a, b) => {
    const aPinned = pinnedItems.includes(a.key)
    const bPinned = pinnedItems.includes(b.key)
    if (aPinned === bPinned) return 0
    return aPinned ? -1 : 1
  })
}

export function MessageSetResult({
  contentId,
  projectId,
  view,
  pinnedItems,
  welcome_messages,
  away_message,
  quick_replies,
  status_texts,
}: MessageSetResultProps) {
  const welcomeItems = sortByPinned(
    welcome_messages.map((msg, i): Item => ({
      key: `welcome-${i}`, label: msg.label, text: msg.text, category: "welcome", index: i + 1,
    })),
    pinnedItems
  )
  const quickReplyItems = sortByPinned(
    quick_replies.map((reply, i): Item => ({
      key: `qr-${i}`, label: reply.title, text: reply.message, category: "quick_reply",
    })),
    pinnedItems
  )
  const statusItems = sortByPinned(
    status_texts.map((status, i): Item => ({
      key: `status-${i}`, label: STATUS_TYPE_LABELS[status.type] ?? status.type, text: status.text, category: "status",
    })),
    pinnedItems
  )

  return (
    <div className="space-y-6">

      {/* Mensajes de bienvenida */}
      <Section
        icon={<MessageSquare className="h-4 w-4" />}
        colorClass="bg-primary/10 text-primary"
        title="Mensajes de bienvenida"
        subtitle="Elige la variación que mejor represente tu negocio"
        count={welcome_messages.length}
      >
        {view === "grid" || view === "table" ? (
          <ItemsView contentId={contentId} projectId={projectId} items={welcomeItems} pinnedItems={pinnedItems} view={view} colorClass="text-primary" indexed />
        ) : (
          <div className="space-y-3">
            {welcomeItems.map((item) => (
              <MessageCard
                key={item.key}
                contentId={contentId}
                projectId={projectId}
                itemKey={item.key}
                pinned={pinnedItems.includes(item.key)}
                category="welcome"
                label={item.label}
                text={item.text}
                index={item.index!}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Mensaje de ausencia */}
      <Section
        icon={<Clock className="h-4 w-4" />}
        colorClass="bg-yellow-500/10 text-yellow-400"
        title="Mensaje de ausencia"
        subtitle="Configuralo en WhatsApp Business → Herramientas para la empresa → Mensaje de ausencia"
      >
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex-1 text-sm leading-relaxed">{away_message}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              <CopyButton text={away_message} />
              <SaveFavoriteButton projectId={projectId} category="away" label="Mensaje de ausencia" text={away_message} />
              <PinButton contentId={contentId} itemKey="away" pinned={pinnedItems.includes("away")} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {away_message.length} caracteres
          </p>
        </div>
      </Section>

      {/* Respuestas rápidas */}
      <Section
        icon={<Zap className="h-4 w-4" />}
        colorClass="bg-blue-500/10 text-blue-400"
        title="Respuestas rápidas"
        subtitle="Configurá cada una en WhatsApp Business → Herramientas → Respuestas rápidas"
        count={quick_replies.length}
      >
        {view === "grid" || view === "table" ? (
          <ItemsView contentId={contentId} projectId={projectId} items={quickReplyItems} pinnedItems={pinnedItems} view={view} colorClass="text-blue-400" />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {quickReplyItems.map((item) => {
              const pinned = pinnedItems.includes(item.key)
              return (
                <div key={item.key} className={cn("flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/20", pinned && "bg-primary/5")}>
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
                    <Zap className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-400">/{item.label.toLowerCase().replace(/\s+/g, "_")}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{item.text}</p>
                  </div>
                  <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                    <CopyButton text={item.text} />
                    <SaveFavoriteButton projectId={projectId} category="quick_reply" label={item.label} text={item.text} />
                    <PinButton contentId={contentId} itemKey={item.key} pinned={pinned} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Estados de WhatsApp */}
      <Section
        icon={<Activity className="h-4 w-4" />}
        colorClass="bg-green-500/10 text-green-400"
        title="Estados de WhatsApp"
        subtitle="Pack de 7 textos para publicar en estados durante la semana"
        count={status_texts.length}
      >
        {view === "grid" || view === "table" ? (
          <ItemsView contentId={contentId} projectId={projectId} items={statusItems} pinnedItems={pinnedItems} view={view} colorClass="text-green-400" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {statusItems.map((item) => {
              const pinned = pinnedItems.includes(item.key)
              return (
                <div key={item.key} className={cn("rounded-lg border border-border bg-card p-3", HOVER_CARD, pinned && "border-primary/40 bg-primary/5")}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CopyButton text={item.text} />
                      <SaveFavoriteButton projectId={projectId} category="status" label={item.label} text={item.text} />
                      <PinButton contentId={contentId} itemKey={item.key} pinned={pinned} />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                  <p className={`mt-1.5 text-right text-[10px] ${item.text.length > 139 ? "text-red-400" : "text-muted-foreground"}`}>
                    {item.text.length}/139
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Section>

    </div>
  )
}

function ItemsView({
  contentId,
  projectId,
  items,
  pinnedItems,
  view,
  colorClass,
  indexed,
}: {
  contentId:   string
  projectId:   string
  items:       Item[]
  pinnedItems: string[]
  view:        "grid" | "table"
  colorClass:  string
  indexed?:    boolean
}) {
  if (items.length === 0) return null

  if (view === "grid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const pinned = pinnedItems.includes(item.key)
          return (
            <div key={item.key} className={cn("rounded-xl border border-border bg-card p-3", HOVER_CARD, pinned && "border-primary/40 bg-primary/5")}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  {indexed && (
                    <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-current/10 text-[9px] font-bold", colorClass)}>
                      {item.index}
                    </span>
                  )}
                  <span className={cn("truncate text-xs font-medium", colorClass)}>{item.label}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <CopyButton text={item.text} />
                  <SaveFavoriteButton projectId={projectId} category={item.category} label={item.label} text={item.text} />
                  <PinButton contentId={contentId} itemKey={item.key} pinned={pinned} />
                </div>
              </div>
              <p className="text-sm leading-relaxed">{item.text}</p>
            </div>
          )
        })}
      </div>
    )
  }

  // table
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {items.map((item) => {
          const pinned = pinnedItems.includes(item.key)
          return (
            <div
              key={item.key}
              className={cn(
                "flex flex-col gap-1.5 px-3 py-2.5 transition-colors hover:bg-accent/20 sm:grid sm:grid-cols-[minmax(90px,140px)_minmax(0,1fr)_auto] sm:items-center sm:gap-3",
                pinned && "bg-primary/5"
              )}
            >
              <span className={cn("shrink-0 text-xs font-medium sm:truncate", colorClass)}>
                {item.label}
              </span>
              <span className="min-w-0 text-sm sm:truncate">{item.text}</span>
              <div className="flex shrink-0 items-center gap-1">
                <CopyButton text={item.text} />
                <SaveFavoriteButton projectId={projectId} category={item.category} label={item.label} text={item.text} />
                <PinButton contentId={contentId} itemKey={item.key} pinned={pinned} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Section({
  icon,
  colorClass,
  title,
  subtitle,
  count,
  children,
}: {
  icon: React.ReactNode
  colorClass: string
  title: string
  subtitle?: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colorClass)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg">
            {title}
            {count !== undefined && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">{count} mensajes</span>
            )}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

function MessageCard({
  contentId,
  projectId,
  itemKey,
  pinned,
  category,
  label,
  text,
  index,
}: {
  contentId: string
  projectId: string
  itemKey:   string
  pinned:    boolean
  category:  "welcome"
  label:     string
  text:      string
  index:     number
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", HOVER_CARD, pinned && "border-primary/40 bg-primary/5")}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {index}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton text={text} />
          <SaveFavoriteButton projectId={projectId} category={category} label={label} text={text} />
          <PinButton contentId={contentId} itemKey={itemKey} pinned={pinned} />
        </div>
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
      <p className="mt-2 text-xs text-muted-foreground">{text.length} caracteres</p>
    </div>
  )
}
