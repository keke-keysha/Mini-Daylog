import { cn } from "@/lib/utils";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeValue)}>
      <div className={cn("h-full rounded-full bg-primary transition-[width] duration-500 ease-out", indicatorClassName)} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
