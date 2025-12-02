import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { supabaseServer } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await supabaseServer();
  const { data: settings } = await supabase
    .from("settings")
    .select("site_name, favicon_url")
    .eq("id", 1)
    .single();

  return {
    title: `${settings?.site_name || "GearsNP"} - Premium F1 Gear`,
    description: "Shop premium F1 merchandise and team gear",
    icons: {
      icon: settings?.favicon_url || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await supabaseServer();
  const { data: settings } = await supabase
    .from("settings")
    .select("primary_color, secondary_color")
    .eq("id", 1)
    .single();

  const primaryColor = settings?.primary_color || "#dc2626";
  const secondaryColor = settings?.secondary_color || "#3b82f6";

  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          :root {
            --primary: ${primaryColor};
            --secondary: ${secondaryColor};
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
