"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Crosshair, Home, Route } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home, activeClass: "nav-active-lavender" },
  { href: "/daily", label: "Daily", icon: CalendarDays, activeClass: "nav-active-blue" },
  { href: "/focus", label: "Focus", icon: Crosshair, activeClass: "nav-active-lavender" },
  { href: "/tracker", label: "Tracker", icon: Route, activeClass: "nav-active-peach" },
  { href: "/library", label: "Library", icon: BookOpen, activeClass: "nav-active-pink" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation({ variant }: { variant: "mobile" | "desktop" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="bottom-nav md:hidden" aria-label="Primary navigation">
        <div className="grid grid-cols-5">
          {items.map(({ href, label, icon: Icon, activeClass }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={cn("bottom-nav-item", active && "is-active", active && activeClass)} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="mt-9 space-y-1" aria-label="Primary navigation">
      {items.map(({ href, label, icon: Icon, activeClass }) => {
        const active = isActive(pathname, href);
        return (
          <Link key={href} href={href} className={cn("sidebar-link", active && "is-active", active && activeClass)} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
