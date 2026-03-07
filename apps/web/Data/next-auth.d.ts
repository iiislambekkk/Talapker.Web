import NextAuth from "next-auth";


declare module "next-auth" {
    interface Session {
        accessToken?: string;
        idToken?: string;
        user: {
            sub: string;
            firstName: string;
            lastName: string;
            email: string;
            image: string;
            name: string;
            role: string;
            tenantId?: string;
        };
        error?: string;
    }
}