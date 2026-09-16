"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import { cn } from "@/lib/utils";

export function Modal({ trigger, title, description, children, contentClassName }: { trigger: React.ReactNode; title: string; description?: string; children: React.ReactNode; contentClassName?: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#292633]/35 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className={cn("fixed inset-x-2 bottom-2 z-50 max-h-[94dvh] overflow-y-auto rounded-[1.75rem] border border-white/70 bg-background/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_28px_80px_rgba(44,38,59,0.22)] backdrop-blur-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(92vw,620px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-7 dark:border-white/10", contentClassName)}>
          <div className="pr-10">
            <Dialog.Title className="font-heading text-2xl font-semibold tracking-tight">{title}</Dialog.Title>
            {description && <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>}
          </div>
          <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-2xl text-muted-foreground transition hover:bg-white/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 dark:hover:bg-white/10" aria-label="Close dialog"><X /></Dialog.Close>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
