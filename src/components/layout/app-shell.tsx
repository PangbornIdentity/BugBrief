"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bug, FileJson, LayoutDashboard, Settings } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: Bug },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/api/v1/openapi.json", label: "API", icon: FileJson },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-zinc-950 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-zinc-200 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-bold text-white">BB</span>
            <span>
              <span className="block text-base font-semibold text-zinc-950">BugBrief</span>
              <span className="block text-xs font-medium text-zinc-500">Quality operations</span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                )}
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 px-5 py-4 text-xs leading-5 text-zinc-500">
          Local demo mode. Synthetic data only.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-950">
              <span className="flex size-8 items-center justify-center rounded-md bg-zinc-950 text-xs font-bold text-white">BB</span>
              BugBrief
            </Link>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              Demo
            </span>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold",
                    active
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
