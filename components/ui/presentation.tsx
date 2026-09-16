import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type PastelTone = "blue" | "lavender" | "pink" | "peach" | "mint" | "yellow";

const toneClasses: Record<PastelTone, string> = {
  blue: "bg-daylog-blue text-daylog-blue-ink",
  lavender: "bg-daylog-lavender text-daylog-lavender-ink",
  pink: "bg-daylog-pink text-daylog-pink-ink",
  peach: "bg-daylog-peach text-daylog-peach-ink",
  mint: "bg-daylog-mint text-daylog-mint-ink",
  yellow: "bg-daylog-yellow text-daylog-yellow-ink",
};

export function PastelIcon({ icon: Icon, tone, className }: { icon: LucideIcon; tone: PastelTone; className?: string }) {
  return <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", toneClasses[tone], className)}><Icon className="size-5" strokeWidth={2} aria-hidden="true" /></span>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ icon: Icon, title, description, action, tone = "lavender", className }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode; tone?: PastelTone; className?: string }) {
  return (
    <div className={cn("grid min-h-44 place-items-center rounded-[1.5rem] border border-dashed border-foreground/10 bg-white/35 p-6 text-center dark:bg-white/[0.03]", className)}>
      <div className="flex max-w-xs flex-col items-center">
        <PastelIcon icon={Icon} tone={tone} />
        <h2 className="mt-4 font-heading text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, value, label, tone, className }: { icon: LucideIcon; value: string; label: string; tone: PastelTone; className?: string }) {
  return (
    <div className={cn("rounded-[1.4rem] p-4 sm:p-5", toneClasses[tone], className)}>
      <Icon className="size-5 opacity-70" strokeWidth={2} aria-hidden="true" />
      <p className="mt-5 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs font-bold opacity-70 sm:text-sm">{label}</p>
    </div>
  );
}
