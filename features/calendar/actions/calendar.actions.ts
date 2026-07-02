"use server"

import { createClient } from "@/lib/supabase/server"
import { calendarEventSchema, type CalendarEventFormValues } from "../schemas/calendar.schema"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

function addInterval(dateStr: string, recurrence: "weekly" | "monthly", n: number): string {
  const d = new Date(dateStr + "T00:00:00Z")
  if (recurrence === "weekly") {
    d.setUTCDate(d.getUTCDate() + 7 * n)
  } else {
    d.setUTCMonth(d.getUTCMonth() + n)
  }
  return d.toISOString().slice(0, 10)
}

export async function createCalendarEventAction(
  data: CalendarEventFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const validated = calendarEventSchema.safeParse(data)
  if (!validated.success) return { error: "Datos inválidos. Revisa el formulario." }
  const v = validated.data

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", v.project_id)
    .eq("user_id", user.id)
    .single()

  if (!project) return { error: "Proyecto no encontrado." }

  const occurrences = v.recurrence === "none" ? 1 : v.repeat_count
  const recurrenceGroupId = occurrences > 1 ? randomUUID() : null

  const rows = Array.from({ length: occurrences }, (_, i) => ({
    user_id:             user.id,
    project_id:          project.id,
    client_id:           project.client_id,
    title:               v.title,
    event_type:          v.event_type,
    notes:               v.notes ?? null,
    scheduled_date:      v.recurrence === "none" ? v.scheduled_date : addInterval(v.scheduled_date, v.recurrence, i),
    recurrence:          v.recurrence,
    recurrence_group_id: recurrenceGroupId,
  }))

  const { error } = await supabase.from("calendar_events").insert(rows)
  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { success: true }
}

export async function updateCalendarEventAction(
  id: string,
  data: Pick<CalendarEventFormValues, "title" | "event_type" | "notes" | "scheduled_date">
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title:          data.title,
      event_type:     data.event_type,
      notes:          data.notes ?? null,
      scheduled_date: data.scheduled_date,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { success: true }
}

export async function toggleEventDoneAction(
  id: string,
  isDone: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("calendar_events")
    .update({ is_done: isDone })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { success: true }
}

export async function deleteCalendarEventAction(
  id: string,
  deleteFuture: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  if (deleteFuture) {
    const { data: event } = await supabase
      .from("calendar_events")
      .select("recurrence_group_id, scheduled_date")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!event) return { error: "Evento no encontrado." }

    if (event.recurrence_group_id) {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("user_id", user.id)
        .eq("recurrence_group_id", event.recurrence_group_id)
        .gte("scheduled_date", event.scheduled_date)

      if (error) return { error: error.message }
      revalidatePath("/calendar")
      return { success: true }
    }
  }

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { success: true }
}
