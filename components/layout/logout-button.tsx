"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  async function logout() {
    toast.success("Logged out");
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Button variant="ghost" size={compact ? "icon" : "default"} className={compact ? "text-muted-foreground" : "h-11 w-full justify-start gap-3 px-3 text-muted-foreground"} onClick={logout} aria-label={compact ? "Logout" : undefined}>
      <LogOut /> {!compact && "Logout"}
    </Button>
  );
}
