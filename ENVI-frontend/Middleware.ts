import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/hypothesis-testing", "/select-fields", "/visualization"]

  // Define auth routes
  const authRoutes = ["/login", "/signup"]

  const path = request.nextUrl.pathname

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("callbackUrl", path)
    redirectUrl.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if trying to access auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hypothesis-testing/:path*",
    "/select-fields/:path*",
    "/visualization/:path*",
    "/login",
    "/signup",
  ],
}
