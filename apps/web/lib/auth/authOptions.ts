import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { env } from "../env";
import { getSession } from "next-auth/react";

type IdTokenType = {
    firstName: string
    lastName: string
    email: string
    image: string
    role: string
}

async function refreshAccessToken(token: any) {
    try {
        const reqBody = new URLSearchParams({
            client_id: "talapker-nextjs",
            client_secret: "talapker-nextjs-secret",
            grant_type: "refresh_token",
            refresh_token: token.refresh_token
        });

        const response = await axios.post(
            `${env.NEXT_PUBLIC_BACKEND_URL}/connect/token`,
            reqBody,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const refreshed = response.data;
        const decoded = jwtDecode(refreshed.access_token) as any;

        console.log("[AUTH]: Successfully refreshed token!");

        return {
            ...token,
            accessToken: refreshed.access_token,
            idToken: refreshed.id_token,
            refresh_token: refreshed.refresh_token ?? token.refresh_token,
            expires_at: decoded.exp! * 1000,
            error: undefined,
        };
    } catch (error) {
        console.error("[AUTH]: Refresh token failed", error);
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

export const authOptions = {
    providers: [
        {
            id: "pharosIdentityServer",
            name: "School Identity Server",
            type: "oauth",
            clientId: "talapker-nextjs",
            wellKnown: `${env.NEXT_PUBLIC_BACKEND_URL}/.well-known/openid-configuration`,
            authorization: { params: { scope: "openid IdentityServer.fullaccess Institutions.fullaccess offline_access", culture: "kk" } },
            idToken: true,
            checks: ["pkce", "state"],
            clientSecret: "talapker-nextjs-secret",
            protection: "pkce",
            profile(profile: any) {
                return {
                    id: profile.sub,
                    sub: profile.sub,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    image: profile.image,
                    role: profile.role
                };
            },
        }
    ],

    callbacks: {
        async jwt({ token, account, trigger, session }: any) {
            // Initial sign in
            if (account) {
                const decoded = jwtDecode(account.access_token) as any;
                return {
                    accessToken: account.access_token,
                    idToken: account.id_token,
                    refresh_token: account.refresh_token,
                    expires_at: decoded.exp * 1000,
                };
            }

            // Force refresh triggered manually (SESSION_STALE interceptor)
            if (trigger === "update" && session?.forceRefresh) {
                console.log("[AUTH]: Force refreshing token due to SESSION_STALE");
                return refreshAccessToken(token);
            }

            // Token still valid
            if (Date.now() < token.expires_at) return token;

            // Token expired — refresh normally
            console.log("[AUTH]: Token expired, refreshing...");
            return refreshAccessToken(token);
        },

        async session({ session, token }: any) {
            if (!token.accessToken || !token.idToken) return session;

            if (token.error) {
                session.error = token.error;
            }

            const accessTokenDecoded: { sub: string; tenantId?: string } = jwtDecode(token.accessToken);
            const idTokenDecoded: IdTokenType = jwtDecode(token.idToken);

            session.user = {
                sub: accessTokenDecoded.sub,
                firstName: idTokenDecoded.firstName ?? "",
                lastName: idTokenDecoded.lastName ?? "",
                email: idTokenDecoded.email ?? "",
                image: idTokenDecoded.image,
                name: `${idTokenDecoded.firstName ?? ""} ${idTokenDecoded.lastName ?? ""}`.trim(),
                role: idTokenDecoded.role ?? "",
                tenantId: accessTokenDecoded.tenantId ?? undefined,
            };

            session.accessToken = token.accessToken;
            session.idToken = token.idToken;
            session.refresh_token = token.refresh_token;

            return session;
        }
    },

    session: {
        strategy: "jwt",
    }
};