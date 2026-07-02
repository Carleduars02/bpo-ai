// =============================================
// TIPOS GLOBALES — Business Profile Optimizer AI
// =============================================

// ---- USUARIO / CONSULTOR ----

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  logo_url: string | null;
  plan: "internal" | "free" | "pro" | "agency";
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ---- CLIENTE (CRM) ----

export type ClientStatus = "active" | "potential" | "archived";

export interface Client {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string | null;
  sector: string;
  description: string | null;
  city: string | null;
  website: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  whatsapp_link: string | null;
  status: ClientStatus;
  source: string | null;
  price: number | null;
  notes: string | null;
  next_followup: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientFormData = Omit<Client, "id" | "user_id" | "created_at" | "updated_at">;

// ---- PROYECTO ----

export type ProjectStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "archived";

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  service_type: string | null;
  objective: string | null;
  notes: string | null;
  status: ProjectStatus;
  initial_score: number | null;
  projected_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones (joins)
  client?: Pick<Client, "business_name" | "sector">;
}

// ---- AUDITORÍA ----

export interface AuditScoreBreakdown {
  identity: number;     // max 25
  information: number;  // max 25
  catalog: number;      // max 20
  communication: number; // max 30
}

export type IssueLevel = "critical" | "moderate" | "minor";

export interface AuditIssue {
  title: string;
  description: string;
  impact: string;
  category: keyof AuditScoreBreakdown;
}

export interface AuditRecommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: number;
  effort: "low" | "medium" | "high";
  category: keyof AuditScoreBreakdown;
}

export interface Audit {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string;
  // Inputs
  profile_photo_url: string | null;
  business_name_input: string | null;
  description_input: string | null;
  category_input: string | null;
  has_schedule: boolean;
  has_location: boolean;
  has_website: boolean;
  has_catalog: boolean;
  catalog_product_count: number;
  catalog_quality: number | null;
  has_welcome_message: boolean;
  has_away_message: boolean;
  quick_replies_count: number;
  posts_status: boolean;
  status_frequency: string | null;
  uses_labels: boolean;
  additional_notes: string | null;
  // Results
  total_score: number;
  scores_breakdown: AuditScoreBreakdown;
  ai_diagnosis: string | null;
  critical_issues: AuditIssue[];
  moderate_issues: AuditIssue[];
  minor_issues: AuditIssue[];
  positive_aspects: string[];
  recommendations: AuditRecommendation[];
  status: "draft" | "completed";
  created_at: string;
}

// ---- CONTENIDO GENERADO ----

export type ContentType =
  | "business_name"
  | "description"
  | "bio"
  | "welcome_message"
  | "away_message"
  | "quick_reply"
  | "status_text"
  | "sales_script"
  | "keywords";

export type ContentTone =
  | "formal"
  | "friendly"
  | "aspirational"
  | "technical"
  | "playful";

export interface GeneratedContent {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string;
  content_type: ContentType;
  prompt_used: string | null;
  raw_output: string;
  edited_content: string | null;
  is_approved: boolean;
  tone: ContentTone | null;
  version: number;
  created_at: string;
}

// ---- CATÁLOGO ----

export interface CatalogItem {
  id: string;
  catalog_id: string;
  user_id: string;
  name: string;
  description: string | null;
  benefits: string[];
  cta: string | null;
  keywords: string[];
  category: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  is_ai_generated: boolean;
  status: "active" | "draft";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Catalog {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  items?: CatalogItem[];
}

// ---- NAVEGACIÓN ----

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// ---- DASHBOARD ----

export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
}

// ---- API RESPONSES ----

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- UI ----

export type ToastVariant = "default" | "success" | "error" | "warning";
