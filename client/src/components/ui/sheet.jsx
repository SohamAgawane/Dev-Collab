// src/components/ui/sheet.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext(null);

export function Sheet({ open, onOpenChange, children }) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      <div className="relative">{children}</div>
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild = false, children }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within <Sheet>");

  const { onOpenChange } = ctx;

  const handleClick = (e) => {
    if (React.isValidElement(children) && children.props.onClick) {
      children.props.onClick(e);
    }
    onOpenChange && onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function SheetContent({ side = "right", className = "", children }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within <Sheet>");

  const { open, onOpenChange } = ctx;

  if (!open) return null;

  const sideClasses =
    side === "left"
      ? "left-0 -translate-x-0"
      : side === "right"
      ? "right-0 translate-x-0"
      : "right-0";

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40"
        onClick={() => onOpenChange && onOpenChange(false)}
      />

      {/* sheet panel */}
      <div
        className={cn(
          "fixed z-50 top-0 h-full w-72 bg-white shadow-xl transition-transform",
          sideClasses,
          className
        )}
      >
        {children}
      </div>
    </>
  );
}
