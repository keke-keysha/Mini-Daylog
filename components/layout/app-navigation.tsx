"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Crosshair, Home, MoreHorizontal, NotebookPen, Route } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home, activeClass: "nav-active-lavender" },
  { href: "/daily", label: "Daily", icon: CalendarDays, activeClass: "nav-active-blue" },
  { href: "/focus", label: "Focus", icon: Crosshair, activeClass: "nav-active-lavender" },
  { href: "/tracker", label: "Activity", icon: Route, activeClass: "nav-active-peach" },
  { href: "/library", label: "Library", icon: BookOpen, activeClass: "nav-active-pink" },
  { href: "/thoughts", label: "Thoughts", icon: NotebookPen, activeClass: "nav-active-lavender" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : (pathname === href || pathname.startsWith(`${href}/`));
}

export function AppNavigation({ variant }: { variant: "mobile" | "desktop" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="bottom-nav md:hidden" aria-label="Primary navigation">
        <div className="grid grid-cols-5">
          {items.slice(0, 4).map(({ href, label, icon: Icon, activeClass }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={cn("bottom-nav-item", active && "is-active", active && activeClass)} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className={cn("bottom-nav-item w-full", items.slice(4).some((item) => isActive(pathname, item.href)) && "is-active nav-active-pink")} aria-label="More destinations: Library and Thoughts">
                <MoreHorizontal aria-hidden="true" /><span>More</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="top" align="end" sideOffset={12} collisionPadding={12} className="z-50 min-w-56 rounded-3xl border border-border bg-background p-2 shadow-xl">
                <DropdownMenu.Label className="px-3 py-2 text-xs font-extrabold text-muted-foreground">More destinations</DropdownMenu.Label>
                {items.slice(4).map(({ href, label, icon: Icon, activeClass }) => <DropdownMenu.Item key={href} asChild><Link href={href} className={cn("sidebar-link outline-none focus:bg-muted", isActive(pathname, href) && "is-active", isActive(pathname, href) && activeClass)} aria-current={isActive(pathname, href) ? "page" : undefined}><Icon aria-hidden="true" /><span>{label}</span></Link></DropdownMenu.Item>)}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
