import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Users,
  Bell,
  Search,
  Menu,
  Plus,
  LogOut,
  User,
  MessageSquare,
  Command,
  ChevronsLeft,
  ChevronsRight,
  PhoneCall,
  HelpCircle,
  CalendarDays,
} from "lucide-react";

import CommandPalette from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// -------------------- Sidebar --------------------

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Projects", icon: FolderKanban, path: "/Projects" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
  { label: "Chat", icon: MessageSquare, path: "/Chat" },
  { label: "Team", icon: Users, path: "/Team" },
];

const supportItems = [
  { label: "Settings", icon: Settings, path: "/Settings" },
  { label: "Contact support", icon: PhoneCall, path: "/contact" },
  { label: "Help center", icon: HelpCircle, path: "/help-center" },
];

const SidebarContent = ({ onClose, user, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderItem = (item, isInMainNav = true) => {
    const isActive =
      isInMainNav &&
      (currentPath === item.path ||
        (item.path !== "/" && currentPath.startsWith(item.path)));

    return (
      <div key={item.path} className="relative group">
        <Link
          to={item.path}
          onClick={onClose}
          className={cn(
            "flex items-center rounded-md text-sm transition-colors px-3 py-2.5",
            collapsed ? "justify-center" : "gap-3",
            isInMainNav && isActive
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <item.icon
            className={cn(
              "w-5 h-5 text-indigo-600",
              isInMainNav && isActive && "text-white"
            )}
          />
          {!collapsed && (
            <span className="font-medium truncate">{item.label}</span>
          )}
        </Link>

        {/* Tooltip when collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-4px] transition-all z-40">
            <div className="whitespace-nowrap rounded-md bg-slate-900 text-white text-xs px-2 py-1 shadow-lg">
              {item.label}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200">
      {/* Brand */}
      <div className="flex items-center border-b border-slate-200/80 h-16 px-4">
        <div className="flex items-center gap-3">
          {/* Gradient D logo */}
          <span className="text-xl font-extrabold bg-gradient-to-tr from-indigo-600 via-sky-500 to-violet-500 bg-clip-text text-transparent leading-none">
            D
          </span>

          {/* Dev Collab wordmark */}
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight font-mono">
                Dev Collab
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                product workspace
              </span>
            </div>
          )}

          {/* Collapse / expand toggle (desktop only) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => renderItem(item, true))}
      </div>

      {/* Bottom area: Support & Workspace */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        {/* Expanded: text + icons */}
        {!collapsed && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 px-1">
              Settings & Support
            </p>
            <div className="space-y-1">
              {supportItems.map((item) => renderItem(item, false))}
            </div>
          </div>
        )}

        {/* Collapsed: icons only + VS Code style tooltips */}
        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            {supportItems.map((item) => renderItem(item, false))}
          </div>
        )}
      </div>
    </div>
  );
};



// -------------------- Top Navigation --------------------

const TopNav = ({ onMenuClick, user, onCommandClick }) => {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSettings = () => {
    navigate("/Settings");
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch {
      // ignore error, still go to login
    }
    navigate("/login");
  };

  return (
    <div className="h-16 bg-white/90 border-b border-slate-200/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </Button>

        {/* Logo on small screens */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-xl font-extrabold bg-gradient-to-tr from-indigo-600 via-sky-500 to-violet-500 bg-clip-text text-transparent leading-none">
            D
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight font-mono text-slate-900">
              Dev Collab
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
              product workspace
            </span>
          </div>
        </div>

        {/* Command-style (desktop) */}
        <div className="hidden md:flex items-center">
          <Button
            variant="outline"
            onClick={onCommandClick}
            className="gap-2 px-4 h-10 bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700 font-medium transition"
          >
            Workspace control
          </Button>
        </div>

      </div>

      <div className="flex items-center gap-2">
        {/* Command button on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={onCommandClick}
        >
          <Command className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="pl-1 pr-3 rounded-full hover:bg-slate-100 gap-2 h-9"
            >
              <Avatar className="w-7 h-7 border border-slate-200">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                ) : (
                  <AvatarFallback className="text-indigo-700 text-xs">
                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {user?.full_name || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleProfile}
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// -------------------- Layout --------------------

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        // not logged in
      }
    };
    fetchUser();
  }, []);

  const currentYear = new Date().getFullYear();

  // Hide layout (sidebar + header + footer) on login route
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:block flex-shrink-0 h-full",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent
          user={user}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile sidebar (always expanded inside sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0 bg-white">
          <SidebarContent
            user={user}
            collapsed={false}
            onToggleCollapse={() => { }}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          onMenuClick={() => setIsMobileMenuOpen(true)}
          user={user}
          onCommandClick={() => setIsCommandOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
            {/* Page content */}
            <div className="flex-1">{children}</div>
            {/* Footer fixed to bottom of layout area */}
            <footer className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {currentYear} Soham Agawane. All rights reserved.
            </footer>
          </div>
        </main>
      </div>

      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </div>
  );
}
