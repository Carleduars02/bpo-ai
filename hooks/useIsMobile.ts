"use client"

import { useSyncExternalStore } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

// Coincide con el breakpoint `md` de Tailwind (768px). En el servidor no hay
// matchMedia, así que se asume `true` (layout angosto) para que el primer
// render nunca muestre el ancho completo que podría desbordar en móvil.
function getServerSnapshot() {
  return true
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
