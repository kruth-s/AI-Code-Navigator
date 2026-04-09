"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/auth">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
