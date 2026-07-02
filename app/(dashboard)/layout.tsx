import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verificación server-side: si no hay usuario, redirigir al login
  // El middleware también lo hace, esto es una capa adicional de seguridad
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Garantizar que existe el perfil en public.users (por si el trigger no disparó)
  await supabase.from("users").upsert(
    { id: user.id, email: user.email! },
    { onConflict: "id", ignoreDuplicates: true }
  )

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name ?? undefined;
  const userEmail = profile?.email ?? user.email;

  // Recordatorios: eventos de calendario pendientes que ya vencieron o vencen pronto
  const today = new Date();
  const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().slice(0, 10);
  const soonStr = inThreeDays.toISOString().slice(0, 10);

  const [{ data: reminders }, { data: followups }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("id, title, scheduled_date, project_id, clients(business_name)")
      .eq("user_id", user.id)
      .eq("is_done", false)
      .lte("scheduled_date", soonStr)
      .order("scheduled_date", { ascending: true })
      .limit(10),
    supabase
      .from("clients")
      .select("id, business_name, next_followup")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .not("next_followup", "is", null)
      .lte("next_followup", soonStr)
      .order("next_followup", { ascending: true })
      .limit(10),
  ]);

  const normalizedReminders = (reminders ?? []).map((r) => {
    const client = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    return {
      id:             r.id,
      type:           "event" as const,
      title:          r.title,
      scheduled_date: r.scheduled_date,
      isOverdue:      r.scheduled_date < todayStr,
      businessName:   (client as { business_name: string } | null)?.business_name ?? "—",
      href:           "/calendar",
    };
  });

  const normalizedFollowups = (followups ?? []).map((c) => ({
    id:             c.id,
    type:           "followup" as const,
    title:          "Seguimiento pendiente",
    scheduled_date: c.next_followup as string,
    isOverdue:      (c.next_followup as string) < todayStr,
    businessName:   c.business_name,
    href:           `/clients/${c.id}`,
  }));

  const allReminders = [...normalizedReminders, ...normalizedFollowups]
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .slice(0, 10);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — fijo en el lado izquierdo */}
      <Sidebar />

      {/* Contenido principal — min-w-0 evita que hijos con ancho fijo (tablas,
          calendario) empujen todo el layout en vez de scrollear internamente */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header userEmail={userEmail} userName={userName} reminders={allReminders} />

        {/* Área de contenido scrolleable */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-w-0 p-4 sm:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
