import { cn } from "@/lib/utils";

// Soft-tinted brand monogram. Color is derived deterministically from the seed so a given brand
// always gets the same tint.
const AVATAR_TINTS = [
  "bg-progress-soft text-progress",
  "bg-pending-soft text-pending",
  "bg-posted-soft text-posted",
  "bg-paid-soft text-paid",
  "bg-danger-soft text-danger",
] as const;

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length] ?? AVATAR_TINTS[0];
}

export function BrandAvatar({
  name,
  seed,
  className,
}: {
  name: string;
  seed?: string;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
        tintFor(seed ?? name),
        className,
      )}
    >
      {initial}
    </span>
  );
}
