import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,_var(--accent),_transparent_48%)] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="DayLog" width={88} height={88} className="mb-4 size-20 object-contain" priority />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to DayLog</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your private space for plans, progress, and memories.</p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
