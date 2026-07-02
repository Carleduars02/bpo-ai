"use client"

import { useRouter } from "next/navigation"

interface ProjectOption {
  id:      string
  name:    string
  clients: { business_name: string } | null
}

interface ProjectFilterSelectProps {
  projects:      ProjectOption[]
  value:         string
  currentParams: { type?: string; q?: string; view?: string }
}

export function ProjectFilterSelect({ projects, value, currentParams }: ProjectFilterSelectProps) {
  const router = useRouter()

  function handleChange(projectId: string) {
    const params = new URLSearchParams()
    if (currentParams.type) params.set("type", currentParams.type)
    if (projectId) params.set("project", projectId)
    if (currentParams.q) params.set("q", currentParams.q)
    if (currentParams.view) params.set("view", currentParams.view)
    const qs = params.toString()
    router.push(qs ? `/images?${qs}` : "/images")
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">Todos los clientes</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.clients?.business_name ?? p.name} — {p.name}</option>
      ))}
    </select>
  )
}
