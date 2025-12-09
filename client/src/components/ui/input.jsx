// src/components/ui/input.jsx
import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 " +
        "text-sm text-slate-900 shadow-sm placeholder:text-slate-400 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 " +
        "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
      {...props}
    />
  );
}
