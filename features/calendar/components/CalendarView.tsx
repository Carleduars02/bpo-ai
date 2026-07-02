"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { EventSheet } from "./EventSheet"
import type { CalendarEventFormValues } from "../schemas/calendar.schema"

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const EVENT_TYPE_STYLES: Record<string, string> = {
  delivery: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  meeting:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  followup: "bg-primary/15 text-primary border-primary/20",
  note:     "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  other:    "bg-muted text-muted-foreground border-border",
}

export interface CalendarEventItem {
  id:                  string
  project_id:          string
  title:               string
  event_type:          string
  notes:               string | null
  scheduled_date:       string
  recurrence:          string
  recurrence_group_id: string | null
  is_done:             boolean
  businessName:        string
}

export interface CalendarProjectOption {
  id:           string
  name:         string
  businessName: string
}

interface CalendarViewProps {
  year:          number
  month:         number // 1-12
  projectFilter: string
  projects:      CalendarProjectOption[]
  events:        CalendarEventItem[]
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function CalendarView({ year, month, projectFilter, projects, events }: CalendarViewProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen]           = useState(false)
  const [sheetMode, setSheetMode]           = useState<"create" | "edit">("create")
  const [sheetDate, setSheetDate]           = useState("")
  const [sheetEvent, setSheetEvent]         = useState<CalendarEventItem | null>(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>()
    for (const e of events) {
      const list = map.get(e.scheduled_date) ?? []
      list.push(e)
      map.set(e.scheduled_date, list)
    }
    return map
  }, [events])

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(year, month - 1, 1))
    const startWeekday = (first.getUTCDay() + 6) % 7 // 0 = Lunes
    const daysInMonth  = new Date(Date.UTC(year, month, 0)).getUTCDate()

    const result: { date: string | null; day: number | null }[] = []
    for (let i = 0; i < startWeekday; i++) result.push({ date: null, day: null })
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: `${year}-${pad(month)}-${pad(d)}`, day: d })
    }
    while (result.length % 7 !== 0) result.push({ date: null, day: null })
    return result
  }, [year, month])

  function navMonth(delta: number) {
    let newMonth = month + delta
    let newYear  = year
    if (newMonth < 1)  { newMonth = 12; newYear -= 1 }
    if (newMonth > 12) { newMonth = 1;  newYear += 1 }
    const params = new URLSearchParams()
    params.set("year", String(newYear))
    params.set("month", String(newMonth))
    if (projectFilter) params.set("project", projectFilter)
    router.push(`/calendar?${params.toString()}`)
  }

  function goToday() {
    const params = new URLSearchParams()
    params.set("year", String(today.getFullYear()))
    params.set("month", String(today.getMonth() + 1))
    if (projectFilter) params.set("project", projectFilter)
    router.push(`/calendar?${params.toString()}`)
  }

  function handleFilterChange(value: string) {
    const params = new URLSearchParams()
    params.set("year", String(year))
    params.set("month", String(month))
    if (value) params.set("project", value)
    router.push(`/calendar?${params.toString()}`)
  }

  function openCreate(date: string) {
    setSheetMode("create")
    setSheetDate(date)
    setSheetEvent(null)
    setSheetOpen(true)
  }

  function openEdit(event: CalendarEventItem) {
    setSheetMode("edit")
    setSheetEvent(event)
    setSheetDate(event.scheduled_date)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navMonth(-1)}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="w-44 text-center text-sm font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            type="button"
            onClick={() => navMonth(1)}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={projectFilter || "all"} onValueChange={(v) => handleFilterChange(v === "all" ? "" : (v as string))}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {projectFilter
                  ? projects.find((p) => p.id === projectFilter)?.businessName ?? "Todos los clientes"
                  : "Todos los clientes"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.businessName} — {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => openCreate(todayStr)}
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Agendar cliente
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="grid min-w-[700px] grid-cols-7">
          {WEEKDAYS.map((d) => (
            <div key={d} className="border-b border-border bg-card px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}

          {cells.map((cell, i) => {
            if (!cell.date) {
              return <div key={i} className="min-h-[100px] border-b border-r border-border bg-background/40" />
            }
            const dayEvents = eventsByDate.get(cell.date) ?? []
            const isToday = cell.date === todayStr
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[100px] cursor-pointer border-b border-r border-border p-1.5 transition-colors hover:bg-accent/40",
                  isToday && "bg-primary/5"
                )}
                onClick={() => openCreate(cell.date!)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isToday ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {cell.day}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); openEdit(e) }}
                      className={cn(
                        "block w-full truncate rounded border px-1.5 py-0.5 text-left text-[10px] font-medium",
                        EVENT_TYPE_STYLES[e.event_type] ?? EVENT_TYPE_STYLES.other,
                        e.is_done && "opacity-40 line-through"
                      )}
                      title={`${e.businessName} — ${e.title}`}
                    >
                      {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 3} más</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <EventSheet
        open={sheetOpen}
        mode={sheetMode}
        date={sheetDate}
        event={sheetEvent}
        projects={projects}
        defaultProjectId={projectFilter || projects[0]?.id || ""}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  )
}

export type { CalendarEventFormValues }
