import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** The standard white rounded card surface used across the app. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-card p-4 shadow-card", className)} {...props} />;
}
