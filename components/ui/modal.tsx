"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import { cn } from "@/lib/utils";

export function Modal({ trigger, title, description, children, contentClassName }: { trigger: React.ReactNode; title: string; description?: string; children: React.ReactNode; contentClassName?: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className={cn("fixed inset-x-3 bottom-3 z-50 max-h-[92dvh] overflow-y-auto rounded-3xl border bg-background p-5 shadow-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(92vw,620px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-6", contentClassName)}>
          <div className="pr-10">
            <Dialog.Title className="text-xl font-semibold tracking-tight">{title}</Dialog.Title>
            {description && <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>}
          </div>
          <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="Close dialog"><X /></Dialog.Close>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
