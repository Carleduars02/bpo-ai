import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Plus,
  ScanSearch,
  Package,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABELS } from "@/constants/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-muted text-muted-foreground",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  review:      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  completed:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  archived:    "bg-muted text-muted-foreground",
};

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [profileResult, clientsResult, activeResult, completedResult, recentResult] =
    await Promise.all([
      supabase
        .from("users")
        .select("full_name")
        .eq("id", userId)
        .single(),

      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("status", "archived"),

      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["pending", "in_progress", "review"]),

      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),

      supabase
        .from("projects")
        .select(`id, name, status, initial_score, created_at, clients ( business_name, sector )`)
        .eq("user_id", userId)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    fullName:          profileResult.data?.full_name ?? null,
    totalClients:      clientsResult.count ?? 0,
    activeProjects:    activeResult.count ?? 0,
    completedProjects: completedResult.count ?? 0,
    recentProjects:    recentResult.data ?? [],
  };
}

function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function MetricCard({
  title,
  value,
  icon,
  description,
  colorClass,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  colorClass: string;
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: "Nuevo cliente",   href: "/clients/new", Icon: Users,        colorClass: "bg-primary/12 text-primary" },
  { label: "Nueva auditoría", href: "/auditor/new",  Icon: ScanSearch,   colorClass: "bg-accent/15 text-accent" },
  { label: "Catálogo",        href: "/catalog/new",  Icon: Package,      colorClass: "bg-warning/15 text-warning" },
  { label: "Mensajes IA",     href: "/messages/new", Icon: MessageSquare,colorClass: "bg-emerald-500/15 text-emerald-400" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { fullName, totalClients, activeProjects, completedProjects, recentProjects } =
    await getDashboardData(user.id);

  const totalProjects = activeProjects + completedProjects;
  const firstName = fullName?.split(" ")[0];
  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHero
        icon={LayoutDashboard}
        eyebrow={
          <span className="flex items-center gap-1.5">
            {greeting}{firstName ? `, ${firstName}` : ""}
            <span className="animate-fade-in">👋</span>
          </span>
        }
        title={<>Resumen de tu <span className="text-primary">actividad</span></>}
        subtitle="Así va tu operación como consultor de perfiles WhatsApp Business."
        actions={
          <Link
            href="/clients/new"
            className={cn(buttonVariants({ size: "sm" }), "shadow-[0_0_16px_-4px_var(--primary)]")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo cliente
          </Link>
        }
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Clientes activos"
          value={totalClients}
          icon={<Users className="h-4 w-4" />}
          description={totalClients === 0 ? "Agrega tu primer cliente" : "En tu CRM"}
          colorClass="bg-primary/12 text-primary"
        />
        <MetricCard
          title="Proyectos en curso"
          value={activeProjects}
          icon={<FolderOpen className="h-4 w-4" />}
          description={activeProjects === 0 ? "Sin proyectos activos" : "Pendientes de completar"}
          colorClass="bg-accent/15 text-accent"
        />
        <MetricCard
          title="Proyectos completados"
          value={completedProjects}
          icon={<CheckCircle2 className="h-4 w-4" />}
          description={completedProjects === 0 ? "Aún no hay completados" : "Optimizaciones entregadas"}
          colorClass="bg-emerald-500/15 text-emerald-400"
        />
        <MetricCard
          title="Total de proyectos"
          value={totalProjects}
          icon={<TrendingUp className="h-4 w-4" />}
          description={totalProjects === 0 ? "Empieza hoy" : "Histórico total"}
          colorClass="bg-warning/15 text-warning"
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">
              Proyectos recientes
            </CardTitle>
            {recentProjects.length > 0 && (
              <Link
                href="/projects"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-7 text-xs text-muted-foreground"
                )}
              >
                Ver todos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No hay proyectos todavía
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Registra un cliente y crea tu primer proyecto de optimización
                </p>
                <Link
                  href="/clients/new"
                  className={cn(buttonVariants({ size: "sm" }), "mt-4")}
                >
                  Registrar primer cliente
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProjects.map((project, idx) => {
                  const client = Array.isArray(project.clients)
                    ? project.clients[0]
                    : project.clients;
                  const score = project.initial_score;
                  const scoreColor =
                    score == null ? "" :
                    score >= 70 ? "text-emerald-400" :
                    score >= 40 ? "text-yellow-400" : "text-destructive";
                  const barColor =
                    score == null ? "bg-muted-foreground/30" :
                    score >= 70 ? "bg-emerald-400" :
                    score >= 40 ? "bg-yellow-400" : "bg-destructive";

                  return (
                    <div key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted/50 text-xs font-bold">
                          {score != null ? (
                            <span className={scoreColor}>{score}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {(client as { business_name?: string } | null)?.business_name ?? "Cliente"}
                          </p>
                          <div className="mt-1.5 h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-all", barColor)}
                              style={{ width: `${score ?? 0}%` }}
                            />
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[11px] shrink-0 ${STATUS_COLORS[project.status] ?? ""}`}
                        >
                          {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                        </Badge>
                      </Link>
                      {idx < recentProjects.length - 1 && (
                        <Separator className="mx-3 opacity-50" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions panel */}
        <div className="space-y-4">
          {/* AI status */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="ai-glow flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </span>
                Motor IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Claude API</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Disponible
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                El motor IA está listo para generar contenido y analizar perfiles.
              </p>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Accesos rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(({ label, href, Icon, colorClass }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col items-start gap-2 rounded-lg border border-border p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40"
                  >
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/templates"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mt-2 w-full justify-start h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="mr-2 h-3.5 w-3.5" />
                Ver plantillas
              </Link>
              <Link
                href="/reports"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Generar reporte
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
