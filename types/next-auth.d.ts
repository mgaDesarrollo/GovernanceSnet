import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      status: string
      image?: string
    }
    accessToken?: string;
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    status: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: string
    role?: string
    status?: string
    error?: string
  }
}

declare module 'next-auth';
declare module 'next-auth/providers/github';
declare module 'next-auth/providers/discord';