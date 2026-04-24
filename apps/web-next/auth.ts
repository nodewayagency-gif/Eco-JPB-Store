import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-ignore
        session.user.role = user.role
      }
      return session
    },
    async signIn({ user }) {
      if (!user.email) return false

      // Automatic Role Mapping upon first login or check
      const adminEmails = ["admin@bitwise.com"]
      const gestorEmails = ["gestor@jpbstore.com"]

      let role = "CUSTOMER"
      if (adminEmails.includes(user.email)) role = "ADMIN"
      else if (gestorEmails.includes(user.email)) role = "OPERATOR"

      // Update role if it doesn't match
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (dbUser && dbUser.role !== role) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: role as any },
        })
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})
