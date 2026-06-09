import { type ReactNode } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";

/**
 * Page header: a small muted eyebrow + bold title, with the language toggle (and an optional
 * page action) on the trailing side. Used by every screen so language switching stays global.
 */
export function AppHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 pt-1">
      <div className="min-w-0 space-y-0.5">
        {eyebrow && <p className="truncate text-sm font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        <LanguageToggle />
      </div>
    </header>
  );
}
