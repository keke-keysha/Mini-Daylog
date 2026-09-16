import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("bento-card flex flex-col p-5 sm:p-6", className)} {...props} />;
}
