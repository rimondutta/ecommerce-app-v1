import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Protect both admin dashboard pages AND admin API routes
      const isAdminRoute =
        (path.startsWith('/admin') && !path.startsWith('/admin/login')) ||
        path.startsWith('/api/admin');

      if (isAdminRoute) {
        return token?.role === "admin" || token?.role === "manager"
      }
      return true
    },
  },
  pages: {
    signIn: "/admin/login",
  }
})

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
