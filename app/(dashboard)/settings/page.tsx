import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/features/settings/components/ProfileForm"
import { User, Shield, Settings } from "lucide-react"
import type { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = { title: "Configuración | BPO AI" }

const PLAN_LABELS: Record<string, string> = {
  internal: "Uso interno",
  starter:  "Starter",
  pro:      "Pro",
  agency:   "Agencia",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, company, plan, created_at")
    .eq("id", user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHero
        icon={Settings}
        title="Configuración"
        subtitle="Gestiona tu perfil y la información de tu cuenta."
      />

      {/* Perfil */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Perfil del consultor
          </h2>
        </div>
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          company={profile?.company ?? ""}
        />
      </div>

      {/* Cuenta */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Cuenta
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Correo electrónico</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs font-medium">
              {PLAN_LABELS[profile?.plan ?? "internal"] ?? profile?.plan}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Miembro desde</span>
            <span className="text-sm">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
