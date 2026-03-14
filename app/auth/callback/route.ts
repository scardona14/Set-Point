import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the intended destination after successful verification
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/error?message=Could not verify email`)
}
