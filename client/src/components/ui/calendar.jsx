// src/components/ui/calendar.jsx

import * as React from "react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function Calendar({ selected, onSelect, className = "" }) {
  const [month, setMonth] = React.useState(
    selected || new Date()
  );

  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const days = eachDayOfInterval({ start, end });

  return (
    <div
      className={cn(
        "w-72 rounded-xl border border-slate-200 bg-white p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          className="text-sm text-indigo-600 hover:underline"
          onClick={() =>
            setMonth(
              new Date(month.getFullYear(), month.getMonth() - 1, 1)
            )
          }
        >
          ←
        </button>

        <p className="text-sm font-medium text-slate-900">
          {format(month, "MMMM yyyy")}
        </p>

        <button
          className="text-sm text-indigo-600 hover:underline"
          onClick={() =>
            setMonth(
              new Date(month.getFullYear(), month.getMonth() + 1, 1)
            )
          }
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-slate-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {days.map((day) => {
          const isSelected =
            selected &&
            format(day, "yyyy-MM-dd") ===
              format(selected, "yyyy-MM-dd");

          return (
            <button
              key={day.toString()}
              onClick={() => onSelect && onSelect(day)}
              className={cn(
                "h-9 w-9 rounded-md text-sm",
                "hover:bg-indigo-100 transition-colors",
                isSelected
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
