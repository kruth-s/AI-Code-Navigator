
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login', // Redirect errors back to login page
    },
    callbacks: {
        async signIn({ user, account, profile }: any) {
            // Allow all sign-ins
            return true;
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            // Redirect to dashboard after successful login
            if (url.startsWith(baseUrl)) return `${baseUrl}/dashboard`;
            else if (url.startsWith("/")) return `${baseUrl}${url}`;
            return baseUrl + "/dashboard";
        },
        async session({ session, token }: any) {
            return session;
        },
    },
    debug: true, // Enable debug mode to see what's happening
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
