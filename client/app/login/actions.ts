"use server";

import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function signInWithGithub() {
  // Redirect to backend GitHub OAuth endpoint
  redirect(`${BACKEND_URL}/api/auth/github/login`);
}

export async function signInWithGoogle() {
  // TODO: Implement Google OAuth on backend
  console.log("Google OAuth not yet implemented on backend");
}
