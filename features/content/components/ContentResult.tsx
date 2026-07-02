"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import type { ProfileContentResult, StatusPostsResult, AnnouncementResult } from "@/lib/ai/content"

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Permisos de portapapeles denegados por el navegador — no hay fallback posible
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={
        "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs " +
        "text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground " +
        (className ?? "")
      }
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-400" /> Copiado</>
      ) : (
        <><Copy className="h-3 w-3" /> Copiar</>
      )}
    </button>
  )
}

function StrategyNote({ note }: { note?: string }) {
  if (!note) return null
  return (
    <section className="rounded-lg border border-border bg-card/50 p-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Nota estratégica: </span>
        {note}
      </p>
    </section>
  )
}

const STRATEGY_BADGE: Record<string, string> = {
  descriptivo:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  aspiracional: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  autoridad:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export function ProfileResult({ result }: { result: ProfileContentResult }) {
  const shortLength = result.short_description.length

  return (
    <div className="space-y-6">
      {/* Business Names */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Nombres comerciales
        </h2>
        <div className="space-y-3">
          {result.business_names.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-background/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold">{item.name}</span>
                    {item.strategy && (
                      <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${STRATEGY_BADGE[item.strategy] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {item.strategy}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.name.length}/25 car.
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.rationale}</p>
                </div>
                <CopyButton text={item.name} className="shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Short Description */}
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Descripción corta del perfil
          </h2>
          <span className={`text-xs font-medium ${shortLength > 139 ? "text-red-400" : shortLength > 120 ? "text-amber-400" : "text-muted-foreground"}`}>
            {shortLength}/139 caracteres
          </span>
        </div>
        <p className="text-sm leading-relaxed">{result.short_description}</p>
        <CopyButton text={result.short_description} />
      </section>

      {/* Long Description */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Descripción larga
          </h2>
          <span className="text-xs text-muted-foreground">
            {result.long_description.length}/500 caracteres
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.long_description}</p>
        <CopyButton text={result.long_description} />
      </section>

      {/* Keywords */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Palabras clave
          </h2>
          <CopyButton text={result.keywords.join(", ")} />
        </div>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((kw, i) => (
            <span
              key={i}
              className="rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <StrategyNote note={result.strategy_note} />
    </div>
  )
}

export function StatusPostsResultView({ result }: { result: StatusPostsResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-1">
        {result.posts.map((post, i) => (
          <section key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                {post.angle}
              </span>
              <CopyButton text={post.text} />
            </div>
            <p className="text-sm leading-relaxed">{post.text}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Imagen sugerida: </span>
              {post.suggested_visual}
            </p>
          </section>
        ))}
      </div>
      <StrategyNote note={result.strategy_note} />
    </div>
  )
}

export function AnnouncementResultView({ result }: { result: AnnouncementResult }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Titular corto (para Estado)
          </h2>
          <CopyButton text={result.headline} />
        </div>
        <p className="text-sm leading-relaxed font-medium">{result.headline}</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Mensaje completo
          </h2>
          <CopyButton text={result.body} />
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.body}</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Llamado a la acción
        </h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{result.cta}</p>
          <CopyButton text={result.cta} />
        </div>
      </section>

      {result.terms_note && (
        <section className="rounded-lg border border-border bg-card/50 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Condiciones sugeridas: </span>
            {result.terms_note}
          </p>
        </section>
      )}

      <StrategyNote note={result.strategy_note} />
    </div>
  )
}
