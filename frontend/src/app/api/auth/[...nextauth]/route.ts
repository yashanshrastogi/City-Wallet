import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken as string;
      (session as any).idToken = token.idToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

export const { GET, POST } = handlers;