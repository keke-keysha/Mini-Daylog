import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-daylog-pink/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-8 size-80 rounded-full bg-daylog-blue/75 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[18%] top-[12%] size-20 rotate-12 rounded-[2rem] bg-daylog-yellow/70" />
      <section className="bento-card relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div aria-hidden="true" className="pastel-grid pointer-events-none absolute inset-x-0 top-0 h-28 opacity-40" />
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 grid size-24 place-items-center rounded-[2rem] bg-white/70 shadow-[0_12px_30px_rgba(62,48,91,0.10)] dark:bg-white/10">
            <Image src="/logo.png" alt="DayLog" width={88} height={88} className="size-20 object-contain" priority />
          </div>
          <p className="eyebrow">Your personal companion</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome to DayLog</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">A soft little space for your plans, progress, and memories.</p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
