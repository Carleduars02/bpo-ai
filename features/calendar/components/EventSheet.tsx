"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calendarEventSchema, type CalendarEventFormValues, EVENT_TYPES, RECURRENCE_OPTIONS,
} from "../schemas/calendar.schema"
import {
  createCalendarEventAction, updateCalendarEventAction, deleteCalendarEventAction,
  toggleEventDoneAction,
} from "../actions/calendar.actions"
import type { CalendarEventItem, CalendarProjectOption } from "./CalendarView"

interface EventSheetProps {
  open:              boolean
  mode:              "create" | "edit"
  date:              string
  event:             CalendarEventItem | null
  projects:          CalendarProjectOption[]
  defaultProjectId:  string
  onClose:           () => void
}

export function EventSheet({ open, mode, date, event, projects, defaultProjectId, onClose }: EventSheetProps) {
  const router = useRouter()
  const [isPending,   startTransition]  = useTransition()
  const [error,        setError]        = useState<string | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema) as unknown as Resolver<CalendarEventFormValues>,
    defaultValues: {
      project_id:     defaultProjectId,
      event_type:     "delivery",
      recurrence:     "none",
      repeat_count:   4,
      scheduled_date: date,
    },
  })

  useEffect(() => {
    if (!open) return
    setError(null)
    setConfirmDeleteAll(false)
    if (mode === "edit" && event) {
      reset({
        project_id:     event.project_id,
        title:          event.title,
        event_type:     event.event_type as CalendarEventFormValues["event_type"],
        notes:          event.notes ?? "",
        scheduled_date: event.scheduled_date,
        recurrence:     "none",
        repeat_count:   1,
      })
    } else {
      reset({
        project_id:     defaultProjectId,
        title:          "",
        event_type:     "delivery",
        notes:          "",
        scheduled_date: date,
        recurrence:     "none",
        repeat_count:   4,
      })
    }
  }, [open, mode, event, date, defaultProjectId, reset])

  const projectId   = watch("project_id")
  const eventType   = watch("event_type")
  const recurrence  = watch("recurrence")

  function onSubmit(data: CalendarEventFormValues) {
    setError(null)
    startTransition(async () => {
      const result = mode === "create"
        ? await createCalendarEventAction(data)
        : await updateCalendarEventAction(event!.id, data)

      if ("error" in result) {
        setError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  function handleToggleDone() {
    if (!event) return
    startTransition(async () => {
      await toggleEventDoneAction(event.id, !event.is_done)
      onClose()
      router.refresh()
    })
  }

  function handleDelete(deleteFuture: boolean) {
    if (!event) return
    startTransition(async () => {
      await deleteCalendarEventAction(event.id, deleteFuture)
      onClose()
      router.refresh()
    })
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Agendar cliente" : "Editar anotación"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Anotá fechas de entrega, reuniones o notas importantes de un cliente."
              : `${event?.businessName ?? ""}`}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Cliente / Proyecto *</Label>
            <Select value={projectId} onValueChange={(v) => v && setValue("project_id", v as string)}>
              <SelectTrigger>
                <SelectValue>
                  {projects.find((p) => p.id === projectId)?.businessName ?? "Selecciona un cliente"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.businessName} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && <p className="text-xs text-red-400">{errors.project_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Título *</Label>
            <Input {...register("title")} placeholder="Ej: Entrega de catálogo final" />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo</Label>
              <Select value={eventType} onValueChange={(v) => v && setValue("event_type", v as CalendarEventFormValues["event_type"])}>
                <SelectTrigger>
                  <SelectValue>
                    {EVENT_TYPES.find((c) => c.value === eventType)?.label ?? "Entrega / Vencimiento"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Fecha *</Label>
              <Input {...register("scheduled_date")} type="date" />
              {errors.scheduled_date && <p className="text-xs text-red-400">{errors.scheduled_date.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Notas importantes</Label>
            <Textarea {...register("notes")} rows={4} placeholder="Detalles a recordar sobre este cliente o entrega…" />
          </div>

          {mode === "create" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Repetir</Label>
                <Select value={recurrence} onValueChange={(v) => v && setValue("recurrence", v as CalendarEventFormValues["recurrence"])}>
                  <SelectTrigger>
                    <SelectValue>
                      {RECURRENCE_OPTIONS.find((r) => r.value === recurrence)?.label ?? "No se repite"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {recurrence !== "none" && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad de veces</Label>
                  <Input {...register("repeat_count")} type="number" min={1} max={52} />
                </div>
              )}
            </div>
          )}

          <SheetFooter className="mt-auto border-t border-border px-0 pt-4">
            {mode === "edit" && event && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleDone}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                    event.is_done ? "bg-green-500/15 text-green-400" : "bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  {event.is_done ? "Resuelto" : "Marcar como resuelto"}
                </button>

                {!confirmDeleteAll ? (
                  <button
                    type="button"
                    onClick={() => event.recurrence_group_id ? setConfirmDeleteAll(true) : handleDelete(false)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleDelete(false)} className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400">
                      Solo esta
                    </button>
                    <button type="button" onClick={() => handleDelete(true)} className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400">
                      Esta y futuras
                    </button>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Agendar" : "Guardar cambios"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
