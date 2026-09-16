"use client";

import { AlertDialog } from "radix-ui";

import { Button } from "@/components/ui/button";

export function ConfirmButton({ label = "Delete", title, description, action }: { label?: string; title: string; description: string; action: () => void | Promise<void> }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild><Button variant="destructive" type="button">{label}</Button></AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-background p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
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
