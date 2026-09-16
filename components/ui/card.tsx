import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("flex flex-col rounded-3xl border bg-card p-5 sm:p-6", className)} {...props} />;
}
