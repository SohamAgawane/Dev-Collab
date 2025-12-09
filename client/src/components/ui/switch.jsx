// src/components/ui/switch.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(false);

  const isOn = isControlled ? checked : internalChecked;

  function toggle() {
    if (disabled) return;

    const next = !isOn;

    if (!isControlled) {
      setInternalChecked(next);
    }

    if (onCheckedChange) onCheckedChange(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={toggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        isOn ? "bg-indigo-600" : "bg-slate-200",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          isOn ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}
