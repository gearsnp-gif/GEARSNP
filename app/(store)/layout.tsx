import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { DesktopNav } from "@/components/store/DesktopNav";
import { MobileNav } from "@/components/store/MobileNav";
import { NavigationProgress } from "@/components/navigation-progress";

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

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const { data: settings } = await supabase
    .from("settings")
    .select("site_name, logo_url, primary_color")
    .eq("id", 1)
    .single();

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationProgress />
      <DesktopNav settings={settings} />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
