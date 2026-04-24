import { auth } from "./auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/", "/login", "/produtos"].some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith("/produtos/")
  )
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")

  if (isApiAuthRoute) return null

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl))
    }
    const role = (req.auth?.user as any)?.role
    if (role !== "ADMIN" && role !== "OPERATOR") {
      return Response.redirect(new URL("/", nextUrl))
    }
  }

  if (!isPublicRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return null
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
