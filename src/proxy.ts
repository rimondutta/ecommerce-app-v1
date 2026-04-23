import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
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
  matcher: ["/admin/:path*"],
}
