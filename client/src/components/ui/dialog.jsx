// src/components/ui/dialog.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext(null);

export function Dialog({ open: openProp, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (value) => {
    if (isControlled) {
      onOpenChange && onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild = false, children }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("DialogTrigger must be used within <Dialog>");
  const { setOpen } = ctx;

  const handleClick = (e) => {
    if (React.isValidElement(children) && children.props.onClick) {
      children.props.onClick(e);
    }
    setOpen(true);
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

export function DialogContent({ className = "", children }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("DialogContent must be used within <Dialog>");
  const { open, setOpen } = ctx;

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl",
          "p-6 sm:p-7",
          "animate-[fadeIn_0.15s_ease-out]",
          className
        )}
      >
        {/* close button in top-right */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-sm"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = "", children }) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = "", children }) {
  return (
    <h2
      className={cn(
        "text-base font-semibold tracking-tight text-slate-900",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className = "", children }) {
  return (
    <p className={cn("text-sm text-slate-500", className)}>{children}</p>
  );
}

export function DialogFooter({ className = "", children }) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}
