// src/components/ui/dropdown-menu.jsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

const DropdownContext = createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/* ---------------------------------- */

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error("Dropdown components must be used inside <DropdownMenu>");
  }
  return ctx;
}

/* ---------------------------------- */

export function DropdownMenuTrigger({ asChild = false, children }) {
  const { open, setOpen } = useDropdown();

  const handleClick = (e) => {
    if (
      React.isValidElement(children) &&
      typeof children.props.onClick === "function"
    ) {
      children.props.onClick(e);
    }
    setOpen((prev) => !prev);
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

/* ---------------------------------- */

export function DropdownMenuContent({ className = "", children }) {
  const { open } = useDropdown();

  if (!open) return null;

  return (
    <div
      className={
        "absolute right-0 mt-2 w-44 origin-top-right rounded-xl border " +
        "border-slate-200 bg-white shadow-lg ring-1 ring-black/5 " +
        "py-1 z-50 " +
        className
      }
    >
      {children}
    </div>
  );
}

/* ---------------------------------- */

export function DropdownMenuLabel({ className = "", children }) {
  return (
    <div
      className={
        "px-3 py-1.5 text-xs font-semibold text-slate-500 " + className
      }
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = "" }) {
  return <div className={"my-1 h-px bg-slate-100 " + className} />;
}

export function DropdownMenuItem({
  className = "",
  children,
  onClick,
  ...props
}) {
  const { setOpen } = useDropdown();

  function handleClick(e) {
    onClick?.(e);
    setOpen(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "flex w-full items-center px-3 py-1.5 text-xs text-slate-700 " +
        "hover:bg-slate-50 hover:text-slate-900 transition-colors " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
