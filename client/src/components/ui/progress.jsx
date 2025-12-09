// src/components/ui/progress.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  max = 100,
  className = "",
}) {
  const percentage = Math.min(Math.max(value, 0), max) / max * 100;

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-200",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
