import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Plus,
  Filter,
  Target,
  NotebookPen,
  Users,
  Video,
  MapPin,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  startOfWeek,
  addDays,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/* ========================================================================= */
/* Dummy data for Jan–May 2025                                               */
/* ========================================================================= */

const SAMPLE_MEETINGS = [
  {
    id: "m-2025-12-03-standup",
    title: "Daily Standup",
    description: "Team sync on ongoing work and blockers.",
    start_time: "2025-01-06T09:30:00",
    meeting_url: "https://meet.example.com/standup-jan",
    call_type: "Internal · Standup",
    host: "Soham",
    location: "Google Meet",
    attendees: ["Soham", "Backend team", "Frontend team"],
    project_id: 101,
    project_name: "Dev Collab Core",
  },

  // -------- February 2025 --------
  {
    id: "m-2025-02-03-1-1",
    title: "1:1 with Manager",
    description: "Career check-in and feedback.",
    start_time: "2025-02-03T15:00:00",
    meeting_url: "https://meet.example.com/one-on-one-feb",
    call_type: "Internal · 1:1",
    host: "Engineering Manager",
    location: "Google Meet",
    attendees: ["Soham", "Manager"],
    project_id: null,
    project_name: null,
  },
  {
    id: "m-2025-02-20-client-review",
    title: "Client Review · Dev Collab",
    description: "Demo latest dashboard & calendar features.",
    start_time: "2025-02-20T17:00:00",
    meeting_url: "https://meet.example.com/client-review-devcollab-feb",
    call_type: "External · Client Review",
    host: "Soham",
    location: "Zoom",
    attendees: ["Client team", "Soham", "PM"],
    project_id: 102,
    project_name: "Dev Collab – Enterprise",
  },

  // -------- March 2025 --------
  {
    id: "m-2025-03-05-retro",
    title: "Sprint Retrospective",
    description: "Discuss what went well and what can be improved.",
    start_time: "2025-03-05T16:00:00",
    meeting_url: "https://meet.example.com/retro-mar",
    call_type: "Internal · Retrospective",
    host: "Scrum Master",
    location: "Google Meet",
    attendees: ["Team"],
    project_id: 101,
    project_name: "Dev Collab Core",
  },
  {
    id: "m-2025-03-18-architecture",
    title: "Architecture Deep Dive",
    description: "Review Dev Collab system design & performance.",
    start_time: "2025-03-18T10:30:00",
    meeting_url: "https://meet.example.com/arch-deep-dive-mar",
    call_type: "Internal · Architecture Review",
    host: "Tech Lead",
    location: "Zoom",
    attendees: ["Tech Lead", "Soham", "Infra team"],
    project_id: 103,
    project_name: "Dev Collab Infra",
  },

  // -------- April 2025 --------
  {
    id: "m-2025-04-10-kickoff",
    title: "Feature Kickoff · Smart Calendar",
    description: "Kickoff new calendar module for Dev Collab.",
    start_time: "2025-04-10T14:00:00",
    meeting_url: "https://meet.example.com/kickoff-smart-calendar-apr",
    call_type: "Internal · Feature Kickoff",
    host: "Product Manager",
    location: "Google Meet",
    attendees: ["PM", "Soham", "Design", "Engineering"],
    project_id: 104,
    project_name: "Dev Collab Calendar",
  },
  {
    id: "m-2025-04-22-customer-success",
    title: "Customer Success Sync",
    description: "Review open tickets and feedback from customers.",
    start_time: "2025-04-22T18:30:00",
    meeting_url: "https://meet.example.com/customer-success-apr",
    call_type: "Internal · CS Sync",
    host: "CS Lead",
    location: "Zoom",
    attendees: ["CS lead", "Soham"],
    project_id: 102,
    project_name: "Dev Collab – Enterprise",
  },

  // -------- May 2025 --------
  {
    id: "m-2025-05-07-roadmap",
    title: "Quarterly Roadmap Review",
    description: "Review upcoming roadmap for Q3.",
    start_time: "2025-05-07T13:00:00",
    meeting_url: "https://meet.example.com/q3-roadmap-may",
    call_type: "Internal · Roadmap Review",
    host: "Head of Product",
    location: "Google Meet",
    attendees: ["Leadership", "Soham"],
    project_id: null,
    project_name: null,
  },
  {
    id: "m-2025-05-19-go-live",
    title: "Go-Live · Enterprise Customer",
    description: "Production launch call with client.",
    start_time: "2025-05-19T20:00:00",
    meeting_url: "https://meet.example.com/go-live-enterprise-may",
    call_type: "External · Go-Live",
    host: "Soham",
    location: "Zoom",
    attendees: ["Client team", "DevOps", "Soham"],
    project_id: 105,
    project_name: "Dev Collab – Go Live",
  },
];

const SAMPLE_TASKS = [
  // Jan 2025
  {
    id: "t-2025-01-03-dashboard",
    title: "Finish dashboard KPI design",
    project_id: 101,
    project_name: "Dev Collab Core",
    created_date: "2025-01-03T10:00:00",
    assigned_date: "2025-01-03T11:00:00",
    due_date: "2025-01-08T23:59:00",
    completed_date: "2025-01-07T16:30:00",
  },
  {
    id: "t-2025-01-20-command-palette",
    title: "Implement command palette shortcuts",
    project_id: 101,
    project_name: "Dev Collab Core",
    created_date: "2025-01-20T09:15:00",
    assigned_date: "2025-01-20T09:30:00",
    due_date: "2025-01-25T23:59:00",
    completed_date: null,
  },

  // Feb 2025
  {
    id: "t-2025-02-05-permissions",
    title: "Add role-based permissions",
    project_id: 102,
    project_name: "Dev Collab – Enterprise",
    created_date: "2025-02-05T11:45:00",
    assigned_date: "2025-02-05T12:00:00",
    due_date: "2025-02-14T23:59:00",
    completed_date: "2025-02-13T18:10:00",
  },
  {
    id: "t-2025-02-18-audit-logs",
    title: "Create audit log module",
    project_id: 103,
    project_name: "Dev Collab Infra",
    created_date: "2025-02-18T10:20:00",
    assigned_date: "2025-02-18T10:45:00",
    due_date: "2025-02-28T23:59:00",
    completed_date: null,
  },

  // Mar 2025
  {
    id: "t-2025-03-02-performance",
    title: "Optimize dashboard performance",
    project_id: 103,
    project_name: "Dev Collab Infra",
    created_date: "2025-03-02T09:00:00",
    assigned_date: "2025-03-02T09:30:00",
    due_date: "2025-03-10T23:59:00",
    completed_date: "2025-03-09T19:45:00",
  },
  {
    id: "t-2025-03-21-activity-feed",
    title: "Enhance activity feed design",
    project_id: 101,
    project_name: "Dev Collab Core",
    created_date: "2025-03-21T13:10:00",
    assigned_date: "2025-03-21T13:20:00",
    due_date: "2025-03-28T23:59:00",
    completed_date: null,
  },

  // Apr 2025
  {
    id: "t-2025-04-04-calendar-core",
    title: "Implement calendar month view",
    project_id: 104,
    project_name: "Dev Collab Calendar",
    created_date: "2025-04-04T10:05:00",
    assigned_date: "2025-04-04T10:15:00",
    due_date: "2025-04-12T23:59:00",
    completed_date: "2025-04-11T17:30:00",
  },
  {
    id: "t-2025-04-16-notifications",
    title: "Add notification pipeline for events",
    project_id: 104,
    project_name: "Dev Collab Calendar",
    created_date: "2025-04-16T09:25:00",
    assigned_date: "2025-04-16T09:40:00",
    due_date: "2025-04-26T23:59:00",
    completed_date: null,
  },

  // May 2025
  {
    id: "t-2025-05-03-access-control",
    title: "Refine calendar access control",
    project_id: 105,
    project_name: "Dev Collab – Go Live",
    created_date: "2025-05-03T11:00:00",
    assigned_date: "2025-05-03T11:15:00",
    due_date: "2025-05-10T23:59:00",
    completed_date: "2025-05-09T17:10:00",
  },
  {
    id: "t-2025-05-18-post-mortem",
    title: "Write go-live post-mortem doc",
    project_id: 105,
    project_name: "Dev Collab – Go Live",
    created_date: "2025-05-18T14:20:00",
    assigned_date: "2025-05-18T14:30:00",
    due_date: "2025-05-25T23:59:00",
    completed_date: null,
  },
];

/* ========================================================================= */
/* Styles & helpers                                                          */
/* ========================================================================= */

const eventStyles = {
  meeting: "bg-indigo-100 text-indigo-700",
  assigned: "bg-sky-100 text-sky-700",
  created: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  deadline: "bg-rose-100 text-rose-700",
  personal: "bg-slate-100 text-slate-800",
};

const eventDotStyles = {
  meeting: "bg-indigo-500",
  assigned: "bg-sky-500",
  created: "bg-amber-500",
  completed: "bg-emerald-500",
  deadline: "bg-rose-500",
  personal: "bg-slate-500",
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ========================================================================= */
/* Calendar Component                                                        */
/* ========================================================================= */

export default function Calendar() {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Local personal items per day
  const [personalEventsByDate, setPersonalEventsByDate] = useState({});
  const personalIdRef = useRef(1);

  // Filters
  const [filters, setFilters] = useState({
    meeting: true,
    assigned: true,
    created: true,
    completed: true,
    deadline: true,
    personal: true,
  });

  // Quick-add form state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickTime, setQuickTime] = useState("");
  const [quickType, setQuickType] = useState("personal");

  const today = new Date();

  useEffect(() => {
    // Clear selected meeting when changing day
    setSelectedMeeting(null);
  }, [selectedDay]);

  /* ----------------------------------------------------------------------- */
  /* Data from backend (fallback to dummy if empty)                          */
  /* ----------------------------------------------------------------------- */

  const { data: meetingsApi = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      try {
        if (!base44.entities.Meeting?.list) return [];
        return await base44.entities.Meeting.list("-start_time", 200);
      } catch {
        return [];
      }
    },
  });

  const { data: tasksApi = [] } = useQuery({
    queryKey: ["tasks-calendar"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const meetings = meetingsApi && meetingsApi.length ? meetingsApi : SAMPLE_MEETINGS;
  const tasks = tasksApi && tasksApi.length ? tasksApi : SAMPLE_TASKS;

  /* ----------------------------------------------------------------------- */
  /* Calendar days (6 weeks grid, Monday start)                              */
  /* ----------------------------------------------------------------------- */

  const daysOfMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const gridStart = startOfWeek(start, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(gridStart, i));
    }
    return days;
  }, [currentMonth]);

  /* ----------------------------------------------------------------------- */
  /* Build events per date                                                   */
  /* ----------------------------------------------------------------------- */

  const eventsByDate = useMemo(() => {
    const map = {};

    const pushEvent = (dateStr, payload) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(payload);
    };

    // ---- Meetings ----
    meetings.forEach((m) => {
      if (!m.start_time) return;
      const dt = new Date(m.start_time);
      const dateKey = format(dt, "yyyy-MM-dd");
      const minutes = dt.getHours() * 60 + dt.getMinutes();

      pushEvent(dateKey, {
        id: m.id,
        type: "meeting",
        time: format(dt, "hh:mm a"),
        minutes,
        title: m.title || "Meeting",
        sub: m.project_name || m.description || "Scheduled meeting",
        icon: CalendarIcon,
        joinUrl: m.meeting_url || m.join_url || null,
        projectId: m.project_id || null,
        callType: m.call_type || "Meeting",
        host: m.host || null,
        location: m.location || null,
        attendees: m.attendees || [],
      });
    });

    // ---- Tasks ----
    tasks.forEach((t) => {
      const projectName = t.project_name || "Project";
      const projectId = t.project_id || null;

      if (t.created_date) {
        const dt = new Date(t.created_date);
        pushEvent(format(dt, "yyyy-MM-dd"), {
          id: `${t.id}-created`,
          type: "created",
          time: format(dt, "hh:mm a"),
          minutes: dt.getHours() * 60 + dt.getMinutes(),
          title: `Task created: ${t.title || ""}`,
          sub: projectName,
          icon: Clock,
          projectId,
          taskId: t.id,
        });
      }

      if (t.assigned_date) {
        const dt = new Date(t.assigned_date);
        pushEvent(format(dt, "yyyy-MM-dd"), {
          id: `${t.id}-assigned`,
          type: "assigned",
          time: format(dt, "hh:mm a"),
          minutes: dt.getHours() * 60 + dt.getMinutes(),
          title: `Task assigned: ${t.title || ""}`,
          sub: projectName,
          icon: Briefcase,
          projectId,
          taskId: t.id,
        });
      }

      if (t.completed_date) {
        const dt = new Date(t.completed_date);
        pushEvent(format(dt, "yyyy-MM-dd"), {
          id: `${t.id}-completed`,
          type: "completed",
          time: format(dt, "hh:mm a"),
          minutes: dt.getHours() * 60 + dt.getMinutes(),
          title: `Task completed: ${t.title || ""}`,
          sub: projectName,
          icon: CheckCircle2,
          projectId,
          taskId: t.id,
        });
      }

      if (t.due_date) {
        const dt = new Date(t.due_date);
        pushEvent(format(dt, "yyyy-MM-dd"), {
          id: `${t.id}-deadline`,
          type: "deadline",
          time: "11:59 pm",
          minutes: 23 * 60 + 59,
          title: `Deadline: ${t.title || ""}`,
          sub: projectName,
          icon: AlertTriangle,
          projectId,
          taskId: t.id,
        });
      }
    });

    // ---- Personal (local) ----
    Object.entries(personalEventsByDate).forEach(([dateKey, items]) => {
      items.forEach((p) => {
        pushEvent(dateKey, {
          id: p.id,
          type: "personal",
          time: p.timeDisplay,
          minutes: p.minutes,
          title: p.title,
          sub: p.kind === "focus" ? "Focus block" : "Personal todo",
          icon: NotebookPen,
          projectId: null,
          taskId: null,
        });
      });
    });

    return map;
  }, [meetings, tasks, personalEventsByDate]);

  /* ----------------------------------------------------------------------- */
  /* Selected day & events                                                   */
  /* ----------------------------------------------------------------------- */

  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedEventsRaw = selectedKey ? eventsByDate[selectedKey] || [] : [];

  const selectedEvents = useMemo(
    () =>
      [...selectedEventsRaw]
        .filter((ev) => filters[ev.type] !== false)
        .sort((a, b) => (a.minutes || 0) - (b.minutes || 0)),
    [selectedEventsRaw, filters]
  );

  /* ----------------------------------------------------------------------- */
  /* Next up today                                                           */
  /* ----------------------------------------------------------------------- */

  const nextTodayEvent = useMemo(() => {
    const todayKey = format(today, "yyyy-MM-dd");
    const list = (eventsByDate[todayKey] || []).filter(
      (ev) => filters[ev.type] !== false
    );
    if (!list.length) return null;

    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const upcoming = list
      .filter((ev) => (ev.minutes || 0) >= nowMinutes)
      .sort((a, b) => (a.minutes || 0) - (b.minutes || 0));

    return upcoming[0] || null;
  }, [eventsByDate, filters, today]);

  /* ----------------------------------------------------------------------- */
  /* Handlers                                                                */
  /* ----------------------------------------------------------------------- */

  const goPrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDay(now);
  };

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!selectedDay || !quickTitle.trim()) return;

    const dateKey = format(selectedDay, "yyyy-MM-dd");

    const minutes = quickTime
      ? (() => {
        const [hStr, mStr] = quickTime.split(":");
        const h = parseInt(hStr || "0", 10);
        const m = parseInt(mStr || "0", 10);
        return h * 60 + m;
      })()
      : 9 * 60;

    const timeDisplay = quickTime
      ? format(new Date(2000, 0, 1, minutes / 60, minutes % 60), "hh:mm a")
      : "09:00 am";

    const id = `local-${personalIdRef.current++}`;

    setPersonalEventsByDate((prev) => {
      const existing = prev[dateKey] || [];
      const next = [
        ...existing,
        {
          id,
          title: quickTitle.trim(),
          timeDisplay,
          minutes,
          kind: quickType,
        },
      ];
      return { ...prev, [dateKey]: next };
    });

    setQuickTitle("");
    setQuickTime("");
    setQuickType("personal");
  };

  const handleEventClick = (ev) => {
    if (ev.type === "meeting") {
      setSelectedMeeting(ev);
      return;
    }
    setSelectedMeeting(null);

    if (ev.projectId) {
      navigate(`${createPageUrl("ProjectDetail")}?id=${ev.projectId}`);
    }
  };

  /* ----------------------------------------------------------------------- */
  /* Small helper for day cell preview                                       */
  /* ----------------------------------------------------------------------- */

  const renderDayCellEvents = (dateKey) => {
    const list = (eventsByDate[dateKey] || []).filter(
      (ev) => filters[ev.type] !== false
    );
    if (!list.length) return null;

    const topThree = list.slice(0, 3);

    return (
      <div className="mt-2 space-y-1">
        {topThree.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center gap-1 text-[10px] truncate"
          >
            <span
              className={`inline-flex h-1.5 w-1.5 rounded-full ${eventDotStyles[ev.type] || "bg-slate-400"
                }`}
            />
            <span className="truncate opacity-80">{ev.title}</span>
          </div>
        ))}
        {list.length > 3 && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            +{list.length - 3} more
          </p>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /* JSX                                                                      */
  /* ========================================================================= */

  return (
    <div className="h-full flex flex-col gap-4 p-2">
      {/* Top strip: month controls + next upcoming */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-gradient-to-r from-indigo-600/10 to-white px-3 py-1">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-800">
              Schedule
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goPrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-900 min-w-[130px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-indigo-600"
              onClick={goToday}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Next upcoming event today */}
        <div className="flex-1 md:max-w-md">
          {nextTodayEvent ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <Target className="w-4 h-4 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  Next up today · {nextTodayEvent.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {nextTodayEvent.time} ·{" "}
                  {nextTodayEvent.sub || "Scheduled work item"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              No upcoming items for today.
            </div>
          )}
        </div>
      </div>

      {/* Main layout: calendar grid + side panel */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[480px]">
        {/* --------------------- Calendar Grid --------------------- */}
        <Card className="flex-1 overflow-hidden rounded-xl shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600/12 to-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-700">
              <Filter className="w-3 h-3" />
              <span className="uppercase tracking-[0.16em] font-medium">
                Month view
              </span>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-[11px] font-medium text-slate-500">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="px-2 py-2 text-center uppercase tracking-[0.12em]"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-100">
            {daysOfMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const inCurrentMonth =
                day.getMonth() === currentMonth.getMonth();

              const hasEvents =
                (eventsByDate[dateKey] || []).some(
                  (ev) => filters[ev.type] !== false
                );

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative h-28 bg-white p-2 text-left align-top
                    transition-all
                    ${isSelected ? "ring-2 ring-indigo-500 z-[1]" : ""}
                    ${!inCurrentMonth
                      ? "bg-slate-50 text-slate-300"
                      : "text-slate-700"
                    }
                    hover:bg-indigo-50
                  `}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-medium ${isToday ? "text-indigo-600" : ""
                        }`}
                    >
                      {format(day, "d")}
                    </span>

                    {hasEvents && (
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 text-[9px] px-1.5 py-0.5 text-slate-600">
                        {(eventsByDate[dateKey] || []).filter(
                          (ev) => filters[ev.type] !== false
                        ).length}
                      </span>
                    )}
                  </div>

                  {renderDayCellEvents(dateKey)}
                </button>
              );
            })}
          </div>
        </Card>

        {/* -------------------- Right: Filters + Day Panel -------------------- */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Filters card */}
          <Card className="rounded-xl shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600/15 to-white px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.16em] text-indigo-700 font-medium">
                Visibility
              </span>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {[
                ["meeting", "Meetings"],
                ["assigned", "Assigned"],
                ["created", "Created"],
                ["completed", "Completed"],
                ["deadline", "Deadlines"],
                ["personal", "Personal"],
              ].map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={filters[key] ? "secondary" : "outline"}
                  size="sm"
                  className="text-[11px] px-2 py-1 h-7"
                  onClick={() => toggleFilter(key)}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${eventDotStyles[key] || "bg-slate-400"
                      }`}
                  />
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Day overview + timeline + meeting detail */}
          <Card className="flex-1 flex flex-col overflow-hidden rounded-xl shadow-sm">
            {/* Panel Header */}
            <div className="py-3 px-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600/15 to-white">
              <span className="uppercase text-[11px] tracking-[0.16em] text-indigo-700 font-medium">
                Day overview
              </span>
              <p className="text-xs font-semibold mt-1 text-slate-900">
                {selectedDay
                  ? format(selectedDay, "EEEE, MMM d")
                  : "Select a day in the calendar"}
              </p>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Quick add planner */}
              {selectedDay && (
                <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50/60">
                  <form
                    onSubmit={handleQuickAdd}
                    className="flex flex-col gap-2 text-xs"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="Add personal todo or focus block..."
                        className="h-8 text-xs"
                      />
                      <Input
                        type="time"
                        value={quickTime}
                        onChange={(e) => setQuickTime(e.target.value)}
                        className="h-8 w-24 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            quickType === "personal" ? "secondary" : "outline"
                          }
                          className="text-[11px] h-7"
                          onClick={() => setQuickType("personal")}
                        >
                          Personal
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            quickType === "focus" ? "secondary" : "outline"
                          }
                          className="text-[11px] h-7"
                          onClick={() => setQuickType("focus")}
                        >
                          Focus block
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Events list + meeting detail */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!selectedDay && (
                  <p className="text-slate-400 text-sm text-center pt-12">
                    Pick a date to see meetings, tasks and personal items.
                  </p>
                )}

                {selectedDay && selectedEvents.length === 0 && (
                  <p className="text-slate-400 text-sm text-center pt-12">
                    No activities scheduled for this day.
                  </p>
                )}

                {selectedDay &&
                  selectedEvents.map((ev) => {
                    const Icon = ev.icon;
                    const isMeeting = ev.type === "meeting" && ev.joinUrl;

                    return (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-full shadow-sm cursor-pointer ${eventStyles[ev.type]}`}
                        onClick={() => handleEventClick(ev)}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ev.title}
                          </p>
                          {ev.sub && (
                            <p className="text-[11px] opacity-70 truncate">
                              {ev.sub}
                            </p>
                          )}
                        </div>

                        <span className="text-[11px] font-semibold whitespace-nowrap mr-1">
                          {ev.time}
                        </span>

                        {isMeeting && (
                          <a
                            href={ev.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center rounded-full bg-indigo-600 text-white px-3 py-1 text-[11px] font-medium hover:bg-indigo-700 transition"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    );
                  })}

                {/* Meeting details panel */}
                {selectedDay && selectedMeeting && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-800 font-semibold">
                          Meeting details
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedMeeting.title}
                        </p>
                      </div>
                      {selectedMeeting.joinUrl && (
                        <a
                          href={selectedMeeting.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full bg-indigo-600 text-white px-3 py-1 text-[11px] font-medium hover:bg-indigo-700 transition"
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Join call
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedMeeting.callType && (
                        <Badge className="bg-white text-indigo-700 border-indigo-100 text-[10px]">
                          {selectedMeeting.callType}
                        </Badge>
                      )}
                      {selectedMeeting.projectId && selectedMeeting.sub && (
                        <Badge className="bg-white text-slate-800 border-slate-200 text-[10px]">
                          Project · {selectedMeeting.sub}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {selectedMeeting.host && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="w-3 h-3" />
                          <span>
                            Host:{" "}
                            <span className="font-medium">
                              {selectedMeeting.host}
                            </span>
                          </span>
                        </div>
                      )}
                      {selectedMeeting.location && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-3 h-3" />
                          <span>
                            Location:{" "}
                            <span className="font-medium">
                              {selectedMeeting.location}
                            </span>
                          </span>
                        </div>
                      )}
                      {selectedMeeting.attendees &&
                        selectedMeeting.attendees.length > 0 && (
                          <div className="flex items-start gap-2 text-slate-700">
                            <Users className="w-3 h-3 mt-[2px]" />
                            <div className="flex flex-wrap gap-1">
                              {selectedMeeting.attendees.map((a) => (
                                <span
                                  key={a}
                                  className="inline-flex items-center rounded-full bg-white/70 border border-slate-200 px-2 py-0.5 text-[10px]"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-3 h-3" />
                        <span>
                          Scheduled at{" "}
                          <span className="font-medium">
                            {selectedMeeting.time}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Day summary footer */}
              {selectedDay && (
                <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <span>
                      Meetings:{" "}
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {
                          selectedEvents.filter((e) => e.type === "meeting")
                            .length
                        }
                      </Badge>
                    </span>
                    <span>
                      Tasks:{" "}
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {
                          selectedEvents.filter((e) =>
                            ["created", "assigned", "completed", "deadline"].includes(
                              e.type
                            )
                          ).length
                        }
                      </Badge>
                    </span>
                    <span>
                      Personal:{" "}
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {
                          selectedEvents.filter((e) => e.type === "personal")
                            .length
                        }
                      </Badge>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
