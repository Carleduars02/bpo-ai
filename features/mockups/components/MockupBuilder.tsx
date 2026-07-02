"use client"

import { useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Download, Loader2, User, MessageCircle, Package as PackageIcon, ShoppingBag } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PhoneFrame } from "./PhoneFrame"
import { ProfileScreen } from "./screens/ProfileScreen"
import { ChatScreen } from "./screens/ChatScreen"
import { CatalogScreen } from "./screens/CatalogScreen"
import { CatalogItemScreen } from "./screens/CatalogItemScreen"
import { BrandAssetUploader } from "./BrandAssetUploader"

export type MockupScreen = "profile" | "chat" | "catalog" | "catalogItem"

export interface MockupCatalogItem {
  name:         string
  description?: string | null
  price?:       number | null
  currency?:    string | null
  imageUrl?:    string | null
}

export interface MockupProject {
  id:            string
  name:          string
  businessName:  string
  description?:  string | null
  sector?:       string | null
  city?:         string | null
  website?:      string | null
  phone?:        string | null
  email?:        string | null
  avatarUrl?:    string | null
  coverUrl?:     string | null
  welcomeMessage?: string | null
  catalogName?:    string | null
  catalogItems:    MockupCatalogItem[]
}

const SCREEN_OPTIONS: { value: MockupScreen; label: string; icon: typeof User }[] = [
  { value: "profile",     label: "Perfil de negocio",   icon: User },
  { value: "chat",        label: "Chat de bienvenida",   icon: MessageCircle },
  { value: "catalog",     label: "Catálogo",             icon: PackageIcon },
  { value: "catalogItem", label: "Detalle de producto",  icon: ShoppingBag },
]

interface MockupBuilderProps {
  projects:          MockupProject[]
  userId:            string
  initialProjectId?: string
}

export function MockupBuilder({ projects, userId, initialProjectId }: MockupBuilderProps) {
  const [projectId, setProjectId] = useState(
    () => projects.find((p) => p.id === initialProjectId)?.id ?? projects[0]?.id ?? ""
  )
  const [selected, setSelected]   = useState<Set<MockupScreen>>(new Set(["profile", "chat", "catalog"]))
  const [itemIndex, setItemIndex] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captureRef = useRef<HTMLDivElement>(null)

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId])

  function toggleScreen(screen: MockupScreen) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(screen)) next.delete(screen)
      else next.add(screen)
      return next
    })
  }

  async function handleDownload() {
    if (!captureRef.current || selected.size === 0) return
    setIsExporting(true)
    setError(null)
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: "transparent",
      })
      const link = document.createElement("a")
      link.download = `mockup-${project?.businessName.toLowerCase().replace(/\s+/g, "-") ?? "whatsapp"}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setError("No se pudo generar la imagen. Intenta de nuevo.")
    } finally {
      setIsExporting(false)
    }
  }

  const availableScreens = SCREEN_OPTIONS.filter((opt) => {
    if (!project) return false
    if (opt.value === "chat") return !!project.welcomeMessage
    if (opt.value === "catalog" || opt.value === "catalogItem") return project.catalogItems.length > 0
    return true
  })

  const selectedItem = project?.catalogItems[itemIndex] ?? project?.catalogItems[0]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="mockup_project">Proyecto</label>
          <select
            id="mockup_project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.businessName} — {p.name}</option>
            ))}
          </select>
        </div>

        {project && (
          <BrandAssetUploader
            projectId={project.id}
            userId={userId}
            businessName={project.businessName}
            avatarUrl={project.avatarUrl}
            coverUrl={project.coverUrl}
          />
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Pantallas a incluir</label>
          <div className="flex flex-wrap gap-2">
            {SCREEN_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isAvailable = availableScreens.some((a) => a.value === opt.value)
              const isChecked = selected.has(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => toggleScreen(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    !isAvailable && "cursor-not-allowed opacity-40",
                    isChecked && isAvailable
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              )
            })}
          </div>
          {project && availableScreens.length < SCREEN_OPTIONS.length && (
            <p className="text-xs text-muted-foreground">
              Algunas pantallas no están disponibles porque el proyecto aún no tiene ese contenido generado.
            </p>
          )}
        </div>

        {selected.has("catalogItem") && project && project.catalogItems.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="mockup_item">Producto para el detalle</label>
            <select
              id="mockup_item"
              value={Math.min(itemIndex, project.catalogItems.length - 1)}
              onChange={(e) => setItemIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {project.catalogItems.map((item, i) => (
                <option key={i} value={i}>{item.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting || selected.size === 0 || !project}
          className={cn(buttonVariants(), "gap-2")}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Descargar imagen
        </button>
      </div>

      {/* Preview / capture area */}
      {project ? (
        <div className="overflow-x-auto rounded-xl border border-dashed border-border p-6">
          <div ref={captureRef} className="flex w-fit gap-6 bg-transparent p-2">
            {selected.has("profile") && (
              <PhoneFrame label="Perfil de negocio">
                <ProfileScreen
                  businessName={project.businessName}
                  description={project.description}
                  sector={project.sector}
                  city={project.city}
                  website={project.website}
                  phone={project.phone}
                  email={project.email}
                  avatarUrl={project.avatarUrl}
                  products={project.catalogItems}
                />
              </PhoneFrame>
            )}
            {selected.has("chat") && project.welcomeMessage && (
              <PhoneFrame label="Chat de bienvenida">
                <ChatScreen
                  businessName={project.businessName}
                  message={project.welcomeMessage}
                  avatarUrl={project.avatarUrl}
                />
              </PhoneFrame>
            )}
            {selected.has("catalog") && project.catalogItems.length > 0 && (
              <PhoneFrame label="Catálogo">
                <CatalogScreen
                  businessName={project.businessName}
                  coverUrl={project.coverUrl}
                  items={project.catalogItems}
                />
              </PhoneFrame>
            )}
            {selected.has("catalogItem") && selectedItem && (
              <PhoneFrame label="Detalle de producto">
                <CatalogItemScreen
                  businessName={project.businessName}
                  avatarUrl={project.avatarUrl}
                  item={selectedItem}
                />
              </PhoneFrame>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No tienes proyectos disponibles.</p>
      )}
    </div>
  )
}
