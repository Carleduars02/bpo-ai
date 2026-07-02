import type { Metadata } from "next"
import { ClientForm } from "@/features/clients/components/ClientForm"

export const metadata: Metadata = {
  title: "Nuevo cliente | BPO AI",
}

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo cliente</h1>
        <p className="text-sm text-muted-foreground">
          Registra un negocio para comenzar a optimizar su perfil de WhatsApp.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ClientForm mode="create" />
      </div>
    </div>
  )
}
