import Image from "next/image";

import { AppNavigation } from "@/components/layout/app-navigation";
import { LogoutButton } from "@/components/layout/logout-button";

export function AppShell({ children, username }: { children: React.ReactNode; username: string }) {
  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r bg-card px-4 py-6 md:flex">
        <div className="flex items-center gap-3 px-2">
          <Image src="/logo.png" alt="DayLog" width={48} height={48} className="size-11 object-contain" priority />
          <div>
            <p className="text-lg font-semibold tracking-tight">DayLog</p>
            <p className="max-w-36 truncate text-xs text-muted-foreground">{username}</p>
          </div>
        </div>
        <AppNavigation variant="desktop" />
        <div className="mt-auto"><LogoutButton /></div>
      </aside>
      <div className="min-w-0 md:col-start-2">
        {children}
      </div>
      <AppNavigation variant="mobile" />
    </div>
  );
}
