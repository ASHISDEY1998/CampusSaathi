import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "sky"
    | "cyan"
    | "indigo"
    | "emerald"
    | "amber"
    | "rose"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80",
    sky:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    cyan:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    indigo:
      "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    rose:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    outline:
      "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
