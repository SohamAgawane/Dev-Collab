// src/components/ui/label.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className = "", children, ...props }) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-slate-700 flex items-center gap-1",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
