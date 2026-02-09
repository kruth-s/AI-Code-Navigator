'use server'

import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function signInWithGithub() {
    await signIn("github", { redirectTo: "/dashboard" })
}

export async function signInWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" })
}
