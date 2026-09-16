"use client";

import { AlertDialog } from "radix-ui";

import { Button } from "@/components/ui/button";

export function ConfirmButton({ label = "Delete", title, description, action }: { label?: string; title: string; description: string; action: () => void | Promise<void> }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild><Button variant="destructive" type="button">{label}</Button></AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-[#292633]/35 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/70 bg-background/95 p-6 shadow-[0_28px_80px_rgba(44,38,59,0.22)] backdrop-blur-xl dark:border-white/10">
          <AlertDialog.Title className="font-heading text-xl font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild><Button variant="outline" type="button">Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action asChild><Button variant="destructive" type="button" onClick={action}>Delete</Button></AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
