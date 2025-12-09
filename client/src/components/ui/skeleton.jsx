// src/components/ui/skeleton.jsx
import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={
        "animate-pulse rounded-md bg-slate-200/70 " + className
      }
    />
  );
}
