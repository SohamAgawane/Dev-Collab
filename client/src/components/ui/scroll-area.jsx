// src/components/ui/scroll-area.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function ScrollArea({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
