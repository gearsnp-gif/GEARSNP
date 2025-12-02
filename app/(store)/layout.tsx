import type { Metadata } from "next";
import DesktopTopNav from "@/components/shared/DesktopTopNav";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

export const metadata: Metadata = {
  title: "GearsNP - Premium F1 Gear",
  description: "Shop premium F1 merchandise and team gear",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopTopNav />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
