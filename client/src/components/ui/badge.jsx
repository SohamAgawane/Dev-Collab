// src/components/ui/badge.jsx
import React from "react";

const baseClasses =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 " +
  "text-xs font-medium transition-colors";

const variantClasses = {
  default:
    "border-transparent bg-indigo-50 text-indigo-700",
  secondary:
    "border-transparent bg-slate-100 text-slate-700",
  outline:
    "border-slate-200 bg-transparent text-slate-700",
  success:
    "border-transparent bg-emerald-50 text-emerald-700",
  destructive:
    "border-transparent bg-red-50 text-red-700",
};

export function Badge({ variant = "default", className = "", children, ...props }) {
  const variantClass = variantClasses[variant] ?? variantClasses.default;

  return (
    <span
      className={`${baseClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
