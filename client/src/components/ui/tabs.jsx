// src/components/ui/tabs.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children, className = "" }) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const setValue = (next) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(next);
    }
    onValueChange && onValueChange(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "text-slate-600 hover:text-slate-900",
        isActive && "bg-white text-slate-900 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div className={cn("mt-1", className)} {...props}>
      {children}
    </div>
  );
}
