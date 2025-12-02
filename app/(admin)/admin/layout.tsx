import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderOpen,
  Flag,
  Package,
  ShoppingCart,
  Truck,
  Calendar,
  Settings,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await supabaseServer();
  const { data: settings } = await supabase
    .from("settings")
    .select("site_name, favicon_url")
    .eq("id", 1)
    .single();

  return {
    title: `Admin Dashboard - ${settings?.site_name || "GearsNP"}`,
    description: `${settings?.site_name || "GearsNP"} Admin Portal`,
    icons: {
      icon: settings?.favicon_url || "/favicon.ico",
    },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/admin-login");
  }

  // Fetch settings for logo and colors
  const { data: settings } = await supabase
    .from("settings")
    .select("site_name, logo_url, primary_color, secondary_color")
    .eq("id", 1)
    .single();

  const siteName = settings?.site_name || "GearsNP";
  const logoUrl = settings?.logo_url;
  const primaryColor = settings?.primary_color || "#dc2626";

  return (
    <>
      <style>{`
        :root {
          --admin-primary: ${primaryColor};
        }
        .admin-primary {
          color: ${primaryColor};
        }
        .admin-primary-bg {
          background-color: ${primaryColor};
        }
      `}</style>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-6 border-b border-border">
            {logoUrl ? (
              <div className="flex items-center gap-3">
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={100}
                  height={60}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold">{siteName}</h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold admin-primary">{siteName}</h1>
                <p className="text-sm text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
          <nav className="p-4 space-y-2">
            {[
              { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
              { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
              { name: 'Teams', href: '/admin/teams', icon: Flag },
              { name: 'Products', href: '/admin/products', icon: Package },
              { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
              { name: 'Deliveries', href: '/admin/deliveries', icon: Truck },
              { name: 'Events', href: '/admin/events', icon: Calendar },
              { name: 'Settings', href: '/admin/settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
