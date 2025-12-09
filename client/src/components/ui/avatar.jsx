// src/components/ui/avatar.jsx
import React from "react";

export function Avatar({ className = "", children, ...props }) {
  return (
    <div
      className={
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full " +
        "bg-slate-100 text-slate-600 items-center justify-center " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className = "", ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      {...props}
    />
  );
}

export function AvatarFallback({ className = "", children, ...props }) {
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-wide ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
