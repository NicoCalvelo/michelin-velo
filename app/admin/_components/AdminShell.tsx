"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, LogOut, Menu, Route, X } from "lucide-react";
import { LogOut as logOutFn } from "@/app/_services/AuthService";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Produits", href: "/admin/products", icon: Package },
  { label: "Expériences", href: "/admin/experiences", icon: Route },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-primary-color text-primary-on" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {item.label}
    </Link>
  );
}

function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logOutFn();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full ${className}`}
    >
      <LogOut className="w-5 h-5 shrink-0" />
      Déconnexion
    </button>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-gray-200 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <span className="font-bold text-lg tracking-tight text-gray-900">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-bold text-base text-gray-900">Admin</span>
        <LogoutButton className="w-auto! p-1.5!" />
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
          {/* Drawer panel */}
          <div className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              <span className="font-bold text-base text-gray-900">⚙ Admin</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} onClick={() => setDrawerOpen(false)} />
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <LogoutButton />
            </div>
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
