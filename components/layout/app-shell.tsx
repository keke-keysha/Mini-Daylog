import Image from "next/image";

import { AppNavigation } from "@/components/layout/app-navigation";
import { LogoutButton } from "@/components/layout/logout-button";

export function AppShell({ children, username }: { children: React.ReactNode; username: string }) {
  return (
    <div className="relative min-h-dvh md:grid md:grid-cols-[272px_minmax(0,1fr)]">
      <div aria-hidden="true" className="pointer-events-none fixed -left-24 top-1/3 -z-10 size-64 rounded-full bg-daylog-pink/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed -right-24 bottom-16 -z-10 size-72 rounded-full bg-daylog-blue/45 blur-3xl" />
      <aside className="fixed bottom-4 left-4 top-4 z-30 hidden w-[244px] flex-col rounded-[2rem] border border-white/70 bg-sidebar/80 px-4 py-5 shadow-[0_18px_50px_rgba(52,42,75,0.10)] backdrop-blur-xl md:flex dark:border-white/10">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="grid size-12 place-items-center rounded-[1.15rem] bg-white/65 shadow-sm dark:bg-white/10">
            <Image src="/logo.png" alt="DayLog" width={48} height={48} className="size-10 object-contain" priority />
          </div>
          <div>
            <p className="font-heading text-xl font-semibold tracking-tight">DayLog</p>
            <p className="max-w-32 truncate text-xs font-bold text-muted-foreground">{username}&apos;s space</p>
          </div>
        </div>
        <AppNavigation variant="desktop" />
        <div className="mt-auto"><LogoutButton /></div>
      </aside>
      <div className="min-w-0 md:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/50 bg-background/75 px-4 backdrop-blur-xl md:hidden dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="DayLog" width={38} height={38} className="size-9 object-contain" priority />
            <div><p className="font-heading text-lg font-semibold leading-none">DayLog</p><p className="mt-1 max-w-48 truncate text-[10px] font-bold text-muted-foreground">{username}&apos;s personal space</p></div>
          </div>
          <LogoutButton compact />
        </header>
        {children}
      </div>
      <AppNavigation variant="mobile" />
    </div>
  );
}
