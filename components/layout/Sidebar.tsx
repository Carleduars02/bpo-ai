"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ScanSearch,
  Package,
  MessageSquare,
  Wand2,
  BookOpen,
  FileText,
  Image,
  CalendarDays,
  Settings,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NAV_SECTIONS } from "@/constants/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FolderOpen,
  ScanSearch,
  Package,
  MessageSquare,
  Wand2,
  BookOpen,
  FileText,
  Image,
  CalendarDays,
  Settings,
  Smartphone,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={cn("h-4 w-4 shrink-0", className)} />;
}

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: string;
  badge?: "soon";
  collapsed: boolean;
  isActive: boolean;
}

function SidebarNavItem({
  href,
  label,
  icon,
  badge,
  collapsed,
  isActive,
}: SidebarNavItemProps) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary shadow-[0_0_16px_-4px_var(--primary)]"
          : "text-sidebar-foreground/70",
        collapsed && "justify-center px-2"
      )}
    >
      {isActive && (
        <span className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-primary" />
      )}
      <NavIcon
        name={icon}
        className={cn(
          "transition-transform duration-150",
          isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
          !collapsed && "group-hover:scale-110"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge === "soon" && (
            <Badge
              variant="outline"
              className="h-4 px-1 text-[10px] font-normal text-muted-foreground border-muted-foreground/30"
            >
              pronto
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        {/* base-ui Tooltip.Trigger renders a button; we nest Link inside */}
        <TooltipTrigger
          className="w-full cursor-default bg-transparent p-0 border-0"
          render={<span />}
        >
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
          {badge === "soon" && " (próximamente)"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2 py-4" : "gap-2.5 px-4 py-4"
      )}
    >
      <div className="ai-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_14px_-2px_var(--primary)]">
        <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold tracking-tight text-sidebar-foreground leading-tight">
            BPO <span className="text-primary">AI</span>
          </p>
          <p className="truncate text-[10px] text-muted-foreground leading-tight">
            Profile Optimizer
          </p>
        </div>
      )}
    </div>
  );
}

function NavList({
  collapsed,
  pathname,
}: {
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
      {NAV_SECTIONS.map((section, sectionIdx) => (
        <div key={sectionIdx} className="space-y-1">
          {section.title && !collapsed && (
            <p className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              <span className="h-1 w-1 rounded-full bg-primary/50" />
              {section.title}
            </p>
          )}
          {section.title && collapsed && (
            <div className="border-t border-sidebar-border mx-2" />
          )}
          {section.items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                collapsed={collapsed}
                isActive={isActive}
              />
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const isMobile = useIsMobile();
  // En móvil siempre en modo ícono: no hay espacio para el sidebar expandido
  // sin tapar el contenido — la preferencia de escritorio no aplica aquí.
  const collapsed = isMobile || sidebarCollapsed;

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "relative flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} pathname={pathname} />

        {/* Collapse toggle — solo tiene sentido en escritorio */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-[72px] z-10 hidden md:flex",
            "h-6 w-6 items-center justify-center rounded-full",
            "border border-sidebar-border bg-sidebar text-sidebar-foreground/60",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "transition-colors shadow-sm cursor-pointer"
          )}
          aria-label={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
