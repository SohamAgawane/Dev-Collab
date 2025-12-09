// src/components/ui/select.jsx (or Components/ui/select.jsx)
import * as React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

export function Select({
  value,
  onValueChange,
  defaultValue,
  children,
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const selected = value !== undefined ? value : internalValue;

  const setSelected = (next) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    if (onValueChange) onValueChange(next);
  };

  return (
    <SelectContext.Provider value={{ selected, setSelected }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border",
        "border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
        "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
      <span className="text-sm">
        {ctx.selected || placeholder}
      </span>
  );
}

export function SelectContent({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = "", ...props }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const { setSelected } = ctx;

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      className={cn(
        "flex w-full items-center px-3 py-2 text-sm text-left",
        "hover:bg-indigo-50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
