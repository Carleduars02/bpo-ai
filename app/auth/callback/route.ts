import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// Recibe el redirect de Supabase tras el login OAuth (Google) y canjea
// el código por una sesión antes de mandar al usuario al dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
