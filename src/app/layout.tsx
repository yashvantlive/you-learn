import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouLearn - Student OS",
  description: "Gamified learning platform for CBSE students.",
  // ✅ Icons Configuration
  icons: {
    icon: [
      { url: "/icons/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/app/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/icons/favicon/favicon-48.png"],
  },
  // ✅ PWA Manifest Link (Since you have public/manifest.json)
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-slate-50 text-slate-900 antialiased")}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}