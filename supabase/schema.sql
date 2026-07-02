-- =============================================
-- BUSINESS PROFILE OPTIMIZER AI — Schema v1.0
-- Ejecutar en Supabase: SQL Editor → New query → Pegar y ejecutar
-- =============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: users (perfil extendido del consultor)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  company     TEXT,
  logo_url    TEXT,
  plan        TEXT NOT NULL DEFAULT 'internal',
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: clients
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  owner_name      TEXT,
  sector          TEXT NOT NULL DEFAULT 'other',
  description     TEXT,
  city            TEXT,
  website         TEXT,
  whatsapp_phone  TEXT,
  email           TEXT,
  whatsapp_link   TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'potential', 'archived')),
  source          TEXT,
  price           DECIMAL(10,2),
  notes           TEXT,
  next_followup   DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: projects
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  service_type    TEXT,
  objective       TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'archived')),
  initial_score   INTEGER,
  projected_score INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  delivery_date   DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: audits
-- =============================================
CREATE TABLE IF NOT EXISTS public.audits (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id),
  project_id            UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id             UUID NOT NULL REFERENCES public.clients(id),
  profile_photo_url     TEXT,
  business_name_input   TEXT,
  description_input     TEXT,
  category_input        TEXT,
  has_schedule          BOOLEAN DEFAULT false,
  has_location          BOOLEAN DEFAULT false,
  has_website           BOOLEAN DEFAULT false,
  has_catalog           BOOLEAN DEFAULT false,
  catalog_product_count INTEGER DEFAULT 0,
  catalog_quality       INTEGER,
  has_welcome_message   BOOLEAN DEFAULT false,
  has_away_message      BOOLEAN DEFAULT false,
  quick_replies_count   INTEGER DEFAULT 0,
  posts_status          BOOLEAN DEFAULT false,
  status_frequency      TEXT,
  uses_labels           BOOLEAN DEFAULT false,
  additional_notes      TEXT,
  total_score           INTEGER NOT NULL DEFAULT 0,
  scores_breakdown      JSONB NOT NULL DEFAULT '{"identity":0,"information":0,"catalog":0,"communication":0}',
  ai_diagnosis          TEXT,
  critical_issues       JSONB DEFAULT '[]',
  moderate_issues       JSONB DEFAULT '[]',
  minor_issues          JSONB DEFAULT '[]',
  positive_aspects      JSONB DEFAULT '[]',
  recommendations       JSONB DEFAULT '[]',
  status                TEXT DEFAULT 'completed'
                        CHECK (status IN ('draft', 'completed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: generated_content
-- =============================================
CREATE TABLE IF NOT EXISTS public.generated_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES public.clients(id),
  content_type    TEXT NOT NULL,
  prompt_used     TEXT,
  raw_output      TEXT NOT NULL,
  edited_content  TEXT,
  is_approved     BOOLEAN DEFAULT false,
  tone            TEXT,
  version         INTEGER DEFAULT 1,
  pinned_items    JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: message_favorites
-- Mensajes individuales guardados por el usuario para que no se
-- pierdan entre generaciones de mensajes con IA
-- =============================================
CREATE TABLE IF NOT EXISTS public.message_favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES public.clients(id),
  category    TEXT NOT NULL CHECK (category IN ('welcome', 'away', 'quick_reply', 'status')),
  label       TEXT,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: calendar_events
-- Seguimiento de clientes: fechas de entrega, reuniones y notas
-- importantes por cliente/proyecto.
-- =============================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id),
  project_id          UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id           UUID NOT NULL REFERENCES public.clients(id),
  title               TEXT NOT NULL,
  event_type          TEXT NOT NULL DEFAULT 'delivery' CHECK (event_type IN ('delivery', 'meeting', 'followup', 'note', 'other')),
  notes               TEXT,
  scheduled_date      DATE NOT NULL,
  recurrence          TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly')),
  recurrence_group_id UUID,
  is_done             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: catalogs
-- =============================================
CREATE TABLE IF NOT EXISTS public.catalogs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES public.clients(id),
  name        TEXT NOT NULL DEFAULT 'Catálogo Principal',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: catalog_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id      UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  benefits        JSONB DEFAULT '[]',
  cta             TEXT,
  keywords        JSONB DEFAULT '[]',
  category        TEXT,
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  image_url       TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: reports
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES public.clients(id),
  title       TEXT NOT NULL,
  sections    JSONB DEFAULT '[]',
  config      JSONB DEFAULT '{}',
  pdf_url     TEXT,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated')),
  generated_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: media
-- =============================================
CREATE TABLE IF NOT EXISTS public.media (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id),
  client_id     UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  file_name     TEXT NOT NULL,
  original_url  TEXT NOT NULL,
  optimized_url TEXT,
  file_size     INTEGER,
  mime_type     TEXT,
  width         INTEGER,
  height        INTEGER,
  media_type    TEXT NOT NULL
                CHECK (media_type IN ('logo', 'cover', 'product', 'profile', 'other')),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: templates
-- =============================================
CREATE TABLE IF NOT EXISTS public.templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.users(id),
  sector          TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  profile         JSONB DEFAULT '{}',
  messages        JSONB DEFAULT '{}',
  catalog_items   JSONB DEFAULT '[]',
  statuses        JSONB DEFAULT '[]',
  strategy        TEXT,
  common_mistakes JSONB DEFAULT '[]',
  is_system       BOOLEAN DEFAULT false,
  is_published    BOOLEAN DEFAULT true,
  usage_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario solo ve sus propios datos
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven su propio perfil
CREATE POLICY "users_own_profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Política: usuarios solo ven sus propios clientes
CREATE POLICY "users_own_clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios proyectos
CREATE POLICY "users_own_projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propias auditorías
CREATE POLICY "users_own_audits" ON public.audits
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven su propio contenido generado
CREATE POLICY "users_own_content" ON public.generated_content
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios mensajes guardados
CREATE POLICY "users_own_message_favorites" ON public.message_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios eventos de calendario
CREATE POLICY "users_own_calendar_events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios catálogos
CREATE POLICY "users_own_catalogs" ON public.catalogs
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios items de catálogo
CREATE POLICY "users_own_catalog_items" ON public.catalog_items
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios reportes
CREATE POLICY "users_own_reports" ON public.reports
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven sus propios archivos
CREATE POLICY "users_own_media" ON public.media
  FOR ALL USING (auth.uid() = user_id);

-- Plantillas del sistema visibles para todos los usuarios autenticados
CREATE POLICY "system_templates_public" ON public.templates
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "users_own_templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_templates" ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- FUNCIÓN: crear perfil al registrarse
-- Se ejecuta automáticamente cuando se crea un usuario en auth.users
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$;

-- Trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ÍNDICES de performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id    ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status      ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_sector      ON public.clients(sector);
CREATE INDEX IF NOT EXISTS idx_projects_user_id    ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id  ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_audits_project_id   ON public.audits(project_id);
CREATE INDEX IF NOT EXISTS idx_catalogs_project_id ON public.catalogs(project_id);
CREATE INDEX IF NOT EXISTS idx_media_client_id     ON public.media(client_id);

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
