import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // For demo: authorize if username is 'test' and password is 'password'
        if (credentials?.username === "test" && credentials?.password === "password") {
          return { id: "1", name: "Test User", role: "user" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach role from token to session if available
      if (token?.role) session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      // On first login, store user's role in the token
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  }
}); 