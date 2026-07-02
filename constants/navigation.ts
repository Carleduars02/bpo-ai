// Configuración de la navegación principal del sidebar

export interface NavItem {
  label: string;
  href: string;
  icon: string; // nombre del ícono de lucide-react
  badge?: "soon";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard",      href: "/",          icon: "LayoutDashboard" },
      { label: "Clientes",       href: "/clients",   icon: "Users" },
      { label: "Proyectos",      href: "/projects",  icon: "FolderOpen" },
    ],
  },
  {
    title: "Herramientas IA",
    items: [
      { label: "Auditor IA",     href: "/auditor",   icon: "ScanSearch" },
      { label: "Mensajes",       href: "/messages",  icon: "MessageSquare" },
      { label: "Contenido IA",   href: "/content",   icon: "Wand2" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { label: "Catálogos",      href: "/catalog",   icon: "Package" },
      { label: "Plantillas",     href: "/templates", icon: "BookOpen" },
      { label: "Mockups",        href: "/mockups",   icon: "Smartphone" },
    ],
  },
  {
    title: "Entregables",
    items: [
      { label: "Reportes PDF",   href: "/reports",   icon: "FileText" },
      { label: "Imágenes",       href: "/images",    icon: "Image" },
      { label: "Calendario",     href: "/calendar",  icon: "CalendarDays" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configuración",  href: "/settings",  icon: "Settings" },
    ],
  },
];

export const SECTORS = [
  // Alimentos
  { value: "restaurant",    label: "Restaurante" },
  { value: "bar",           label: "Bar / Cantina" },
  { value: "catering",      label: "Catering / Eventos" },
  { value: "bakery",        label: "Pastelería / Panadería" },
  { value: "delivery",      label: "Delivery / Comida para llevar" },
  // Belleza
  { value: "salon",         label: "Salón de Belleza" },
  { value: "barbershop",    label: "Barbería" },
  { value: "spa",           label: "Spa / Estética" },
  { value: "nails",         label: "Uñas / Nail Salon" },
  // Hogar
  { value: "hardware",      label: "Ferretería" },
  { value: "plumbing",      label: "Plomería / Electricidad" },
  { value: "cleaning",      label: "Limpieza del Hogar" },
  { value: "decor",         label: "Decoración" },
  // Salud
  { value: "veterinary",    label: "Veterinaria" },
  { value: "gym",           label: "Gimnasio / Fitness" },
  { value: "nutrition",     label: "Nutrición" },
  { value: "massage",       label: "Masajes / Bienestar" },
  // Profesionales
  { value: "lawyer",        label: "Abogado / Estudio Jurídico" },
  { value: "accountant",    label: "Contador / Asesor Fiscal" },
  { value: "architect",     label: "Arquitecto / Diseñador" },
  { value: "consultant",    label: "Consultor de Negocios" },
  { value: "marketing",     label: "Agencia de Marketing" },
  // Comercio
  { value: "clothing",      label: "Tienda de Ropa / Moda" },
  { value: "tech",          label: "Tecnología / Electrónica" },
  { value: "flowers",       label: "Florería" },
  { value: "pharmacy",      label: "Farmacia" },
  // Educación
  { value: "tutoring",      label: "Clases Particulares" },
  { value: "language",      label: "Academia de Idiomas" },
  { value: "institute",     label: "Instituto de Formación" },
  // Otro
  { value: "other",         label: "Otro" },
] as const;

export type SectorValue = typeof SECTORS[number]["value"];

export const CLIENT_SOURCES = [
  { value: "referral",     label: "Referido de otro cliente" },
  { value: "social",       label: "Redes sociales" },
  { value: "cold_outreach",label: "Prospección directa" },
  { value: "website",      label: "Sitio web" },
  { value: "event",        label: "Evento / Networking" },
  { value: "other",        label: "Otro" },
] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending:     "Pendiente",
  in_progress: "En progreso",
  review:      "En revisión",
  completed:   "Completado",
  archived:    "Archivado",
};

export const PROJECT_STATUSES = [
  { value: "pending",     label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "review",      label: "En revisión" },
  { value: "completed",   label: "Completado" },
  { value: "archived",    label: "Archivado" },
] as const;

export const SERVICE_TYPES = [
  { value: "profile_optimization",  label: "Optimización de perfil" },
  { value: "catalog_setup",         label: "Configuración de catálogo" },
  { value: "message_templates",     label: "Plantillas de mensajes" },
  { value: "full_audit",            label: "Auditoría completa" },
  { value: "training",              label: "Capacitación" },
  { value: "other",                 label: "Otro" },
] as const;

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  active:    "Activo",
  potential: "Potencial",
  archived:  "Archivado",
};
