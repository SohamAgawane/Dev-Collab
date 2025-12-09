// src/components/ui/popover.jsx

import * as React from "react";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext(null);

export function Popover({ children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children }) {
  const { open, setOpen } = React.useContext(PopoverContext);

  return (
    <div onClick={() => setOpen(!open)}>
      {children}
    </div>
  );
}

export function PopoverContent({ className = "", children }) {
  const { open } = React.useContext(PopoverContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 right-0",
        className
      )}
    >
      <div className="rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  );
}
