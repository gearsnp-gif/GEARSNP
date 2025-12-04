"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/teams", label: "Teams" },
  { href: "/events", label: "Events" },
];

export default function DesktopTopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              GearsNP
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="p-2 hover:text-primary transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
