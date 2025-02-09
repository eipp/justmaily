import NextAuth, { DefaultSession } from "next-auth";

// Extend the session type to include a role property
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: string;
    };
  }
}

// Extend the JWT type to include a role property
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

// Extend the User type to include a role property
declare module "next-auth" {
  interface User {
    role?: string;
  }
}

// Extend the AdapterUser type to include a role property
declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string;
  }
} 