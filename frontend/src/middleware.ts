import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPrefixes = [
  "/appointments",
  "/notifications",
  "/records",
  "/consultations",
  "/prescriptions",
  "/patients",
  "/questionnaires",
  "/statistics",
  "/admin",
  "/settings",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("telemed_access")?.value
  const hasLocalAuthHint = request.cookies.get("telemed_authed")?.value === "1"

  const isProtected =
    pathname === "/" ||
    protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isProtected && !accessToken && !hasLocalAuthHint) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && (accessToken || hasLocalAuthHint)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
