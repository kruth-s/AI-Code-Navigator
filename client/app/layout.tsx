import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using Outfit for that modern look
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AKAZA - AI Code Navigator",
  description: "Join our community today",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body className={`${outfit.className} scrollbar-hide`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
