"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  LogOut,
  User,
  ChevronRight,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { CommandPalette } from "@/components/shared/CommandPalette";

const ROUTE_LABELS: Record<string, string> = {
  "":          "Dashboard",
  clients:     "Clientes",
  projects:    "Proyectos",
  auditor:     "Auditor IA",
  catalog:     "Catálogos",
  messages:    "Mensajes",
  templates:   "Plantillas",
  reports:     "Reportes PDF",
  images:      "Imágenes",
  calendar:    "Calendario",
  settings:    "Configuración",
  new:         "Nuevo",
  edit:        "Editar",
  audit:       "Auditoría",
  content:     "Contenido",
  report:      "Reporte",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <span className="text-sm font-medium text-foreground">Dashboard</span>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      {segments.map((segment, idx) => {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            segment
          );
        const label = isUUID ? "Detalle" : (ROUTE_LABELS[segment] ?? segment);
        const isLast = idx === segments.length - 1;

        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            )}
            <span
              className={
                isLast
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

interface ReminderItem {
  id:             string;
  type:           "event" | "followup";
  title:          string;
  scheduled_date: string;
  isOverdue:      boolean;
  businessName:   string;
  href:           string;
}

interface HeaderProps {
  userEmail?: string;
  userName?: string;
  reminders?: ReminderItem[];
}

const REMINDERS_SEEN_KEY = "bpo-ai:seen-reminders";

function reminderKey(r: ReminderItem) {
  return `${r.type}:${r.id}:${r.scheduled_date}`;
}

export function Header({ userEmail, userName, reminders = [] }: HeaderProps) {
  const router = useRouter();
  const [seenKeys, setSeenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    // localStorage no existe en el servidor, así que no puede leerse en el
    // inicializador de useState (rompería el render SSR) — debe ser un efecto.
    try {
      const raw = localStorage.getItem(REMINDERS_SEEN_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSeenKeys(new Set(JSON.parse(raw)));
    } catch {
      // localStorage unavailable — badge just won't persist across reloads
    }
  }, []);

  const unseenCount = reminders.filter((r) => !seenKeys.has(reminderKey(r))).length;

  function markRemindersSeen() {
    const next = new Set(reminders.map(reminderKey));
    setSeenKeys(next);
    try {
      localStorage.setItem(REMINDERS_SEEN_KEY, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-4 gap-4">
      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <CommandPalette />

        {/* AI indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          <span>IA activa</span>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Notifications */}
        <DropdownMenu onOpenChange={(open) => { if (open) markRemindersSeen(); }}>
          <DropdownMenuTrigger
            className="outline-none"
            render={
              <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <Bell className="h-4 w-4" />
                {unseenCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unseenCount}
                  </span>
                )}
                <span className="sr-only">Notificaciones</span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Recordatorios</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {reminders.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                Sin pendientes próximos.
              </div>
            ) : (
              reminders.map((r) => (
                <DropdownMenuItem
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleNavigate(r.href)}
                  className="flex-col items-start gap-0.5 py-2"
                >
                  <div className="flex w-full items-center gap-1.5">
                    {r.isOverdue ? (
                      <AlertCircle className="h-3 w-3 shrink-0 text-red-400" />
                    ) : r.type === "followup" ? (
                      <Clock className="h-3 w-3 shrink-0 text-primary" />
                    ) : (
                      <CalendarDays className="h-3 w-3 shrink-0 text-primary" />
                    )}
                    <span className="truncate text-xs font-medium">{r.title}</span>
                  </div>
                  <span className="pl-4.5 text-[11px] text-muted-foreground">
                    {r.businessName} · {r.isOverdue ? "Vencido" : "Vence"} {new Date(r.scheduled_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigate("/calendar")}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Ver calendario completo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu — DropdownMenuTrigger wraps our Avatar button */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            render={
              <button className="rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  {userName && (
                    <p className="text-sm font-medium leading-none">{userName}</p>
                  )}
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Perfil y configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
