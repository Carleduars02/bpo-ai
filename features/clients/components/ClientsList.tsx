"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Phone, Globe, MapPin, ChevronRight, Trash2 } from "lucide-react"
import { SECTORS } from "@/constants/navigation"
import { ClientStatusBadge } from "./ClientStatusBadge"
import { BulkActionBar } from "@/components/shared/BulkActionBar"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { bulkUpdateClientStatusAction, bulkDeleteClientsAction } from "../actions/client.actions"

type ClientStatus = "active" | "potential" | "archived"

const STATUS_ACTIONS: { value: ClientStatus; label: string }[] = [
  { value: "active",    label: "Activo" },
  { value: "potential", label: "Potencial" },
  { value: "archived",  label: "Archivado" },
]

export interface ClientRow {
  id:             string
  business_name:  string
  sector:         string
  city:           string | null
  whatsapp_phone: string | null
  website:        string | null
  status:         string
}

interface ClientsListProps {
  clients: ClientRow[]
  view:    ViewMode
}

function sectorLabel(value: string) {
  return SECTORS.find((s) => s.value === value)?.label ?? value
}

export function ClientsList({ clients, view }: ClientsListProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === clients.length ? new Set() : new Set(clients.map((c) => c.id))))
  }

  function clear() {
    setSelected(new Set())
  }

  function runBulkStatus(status: ClientStatus) {
    const ids = Array.from(selected)
    startTransition(async () => {
      await bulkUpdateClientStatusAction(ids, status)
      clear()
      router.refresh()
    })
  }

  function runBulkDelete() {
    const ids = Array.from(selected)
    startTransition(async () => {
      await bulkDeleteClientsAction(ids)
      clear()
      router.refresh()
    })
  }

  const isAllSelected = clients.length > 0 && selected.size === clients.length

  return (
    <>
      {clients.length > 0 && (
        <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            className="h-3.5 w-3.5 rounded border-border accent-primary"
          />
          Seleccionar todos en esta página
        </label>
      )}

      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className={cn(
                "relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/20",
                selected.has(client.id) ? "border-primary/50 bg-primary/5" : "border-border"
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(client.id)}
                onChange={() => toggle(client.id)}
                className="absolute right-3 top-3 z-10 h-4 w-4 rounded border-border accent-primary"
              />
              <Link href={`/clients/${client.id}`} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2 pr-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {client.business_name.charAt(0).toUpperCase()}
                  </div>
                  <ClientStatusBadge status={client.status} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{client.business_name}</p>
                  <p className="text-xs font-medium text-foreground/60">{sectorLabel(client.sector)}</p>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {client.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{client.city}</span>
                    </span>
                  )}
                  {client.whatsapp_phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{client.whatsapp_phone}</span>
                    </span>
                  )}
                  {client.website && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {(() => { try { return new URL(client.website).hostname } catch { return client.website } })()}
                      </span>
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span />
              <span>Cliente</span>
              <span>Sector</span>
              <span>Ciudad</span>
              <span>Teléfono</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-border">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/30",
                    selected.has(client.id) && "bg-primary/5"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(client.id)}
                    onChange={() => toggle(client.id)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                  <Link href={`/clients/${client.id}`} className="truncate font-medium hover:text-primary">
                    {client.business_name}
                  </Link>
                  <span className="truncate text-muted-foreground">{sectorLabel(client.sector)}</span>
                  <span className="truncate text-muted-foreground">{client.city || "—"}</span>
                  <span className="truncate text-muted-foreground">{client.whatsapp_phone || "—"}</span>
                  <ClientStatusBadge status={client.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {clients.map((client) => (
            <div
              key={client.id}
              className={cn(
                "flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent/30 first:rounded-t-xl last:rounded-b-xl",
                selected.has(client.id) && "bg-primary/5"
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(client.id)}
                onChange={() => toggle(client.id)}
                className="h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
              />
              <Link href={`/clients/${client.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {client.business_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{client.business_name}</span>
                    <ClientStatusBadge status={client.status} />
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/60">
                      {sectorLabel(client.sector)}
                    </span>
                    {client.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {client.city}
                      </span>
                    )}
                    {client.whatsapp_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.whatsapp_phone}
                      </span>
                    )}
                    {client.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {(() => { try { return new URL(client.website).hostname } catch { return client.website } })()}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <BulkActionBar count={selected.size} onClear={clear} isPending={isPending}>
        {STATUS_ACTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => runBulkStatus(s.value)}
            disabled={isPending}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {s.label}
          </button>
        ))}
        <div className="h-4 w-px bg-border" />
        <button
          type="button"
          onClick={runBulkDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </BulkActionBar>
    </>
  )
}
