import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
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
      "bg-slate-800 text-slate-300 border-slate-700",
    cyan:
      "bg-cyan-950/80 text-cyan-300 border-cyan-500/30",
    indigo:
      "bg-indigo-950/80 text-indigo-300 border-indigo-500/30",
    emerald:
      "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
    amber:
      "bg-amber-950/80 text-amber-300 border-amber-500/30",
    rose:
      "bg-rose-950/80 text-rose-300 border-rose-500/30",
    outline:
      "bg-transparent text-slate-300 border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
