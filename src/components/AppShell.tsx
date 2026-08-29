import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Database,
  Fingerprint,
  Gavel,
  LayoutDashboard,
  Menu,
  ScrollText,
  ShieldCheck,
  Trophy,
  UserRoundCheck,
  Users,
  Wallet,
  Flag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizations } from "@/data/mock";
import { roleLabels, useAppState } from "@/context/app-state";
import { useMockStore } from "@/context/mock-store";

import type { RoleKey } from "@/data/domain";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Users; roles: RoleKey[] };
type NavGroup = { group: string; items: NavItem[] };

const ALL: RoleKey[] = ["association_admin", "event_organizer", "referee", "team_manager"];

const navigation: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
      {
        to: "/app/analytics",
        label: "Analytics",
        icon: Activity,
        roles: ["association_admin", "event_organizer"],
      },
    ],
  },
  {
    group: "Identity & Organization",
    items: [
      { to: "/app/identity", label: "Identity & Access", icon: Fingerprint, roles: ALL },
      {
        to: "/app/organizations",
        label: "Organizations",
        icon: Building2,
        roles: ["association_admin"],
      },
      {
        to: "/app/master-data",
        label: "Master Data",
        icon: Database,
        roles: ["association_admin"],
      },
    ],
  },
  {
    group: "People & Teams",
    items: [
      {
        to: "/app/people",
        label: "People",
        icon: Users,
        roles: ["association_admin", "team_manager"],
      },
      {
        to: "/app/referees",
        label: "Referees",
        icon: Flag,
        roles: ["association_admin", "referee"],
      },
      {
        to: "/app/teams",
        label: "Teams",
        icon: UserRoundCheck,
        roles: ["association_admin", "team_manager", "event_organizer"],
      },
    ],
  },
  {
    group: "Licensing & Competition",
    items: [
      {
        to: "/app/licensing",
        label: "Licensing",
        icon: ClipboardCheck,
        roles: ["association_admin", "event_organizer", "team_manager"],
      },
      {
        to: "/app/competitions",
        label: "Competitions",
        icon: Trophy,
        roles: ["association_admin", "event_organizer"],
      },
      { to: "/app/matches", label: "Matches", icon: CalendarClock, roles: ALL },
      {
        to: "/app/assignments",
        label: "Referee Assignment",
        icon: ShieldCheck,
        roles: ["association_admin", "referee"],
      },
    ],
  },
  {
    group: "Finance & Governance",
    items: [
      {
        to: "/app/honorarium",
        label: "Honorarium",
        icon: Wallet,
        roles: ["association_admin", "referee"],
      },
      { to: "/app/governance", label: "Governance", icon: Gavel, roles: ["association_admin"] },
      { to: "/app/audit", label: "Audit Trail", icon: ScrollText, roles: ["association_admin"] },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useAppState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
      {navigation.map((group) => {
        const items = group.items.filter((i) => i.roles.includes(role));
        if (!items.length) return null;
        return (
          <div key={group.group}>
            <p className="px-2 pb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <div className="mt-auto rounded border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        UI shell MVP — data contoh. Peran & tenant di sini hanya mengatur tampilan, bukan security
        boundary.
      </div>
    </nav>
  );
}

function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean).slice(1);
  return (
    <nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground md:block">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link to="/app" className="hover:text-foreground">
            Dashboard
          </Link>
        </li>
        {segments.map((seg, i) => (
          <li key={`${seg}-${i}`} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <span className={cn(i === segments.length - 1 && "text-foreground")}>
              {seg.replace(/-/g, " ")}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, organizationId, setOrganizationId, actorName } = useAppState();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useMockStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = unreadCount;


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            className="rounded border border-border p-1.5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka navigasi"
          >
            <Menu className="size-4" aria-hidden />
          </button>

          <Link to="/app" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
              FE
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Futsal Ecosystem
            </span>
          </Link>

          <Breadcrumbs />

          <div className="ml-auto flex items-center gap-2">
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger className="h-9 w-[150px] text-xs sm:w-[210px]" aria-label="Tenant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((o) => (
                  <SelectItem key={o.id} value={o.id} className="text-xs">
                    {o.shortName} · {o.type.replace(/_/g, " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={(v) => setRole(v as RoleKey)}>
              <SelectTrigger className="h-9 w-[130px] text-xs sm:w-[170px]" aria-label="Peran">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as RoleKey[]).map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative size-9" aria-label="Notifikasi">
                  <Bell className="size-4" aria-hidden />
                  {unread > 0 ? (
                    <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {unread}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <p className="border-b border-border px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                  Notification Center
                </p>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="border-b border-border px-3 py-2.5 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.unread ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {n.event} · {n.at}
                      </p>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <div className="hidden items-center gap-2 border-l border-border pl-2 md:flex">
              <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold">
                {actorName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-medium">{actorName}</p>
                <p className="text-[10px] text-muted-foreground">{roleLabels[role]}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border bg-sidebar lg:block">
          <Sidebar />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-sidebar">
              <div className="flex h-14 items-center justify-between border-b border-border px-3">
                <span className="text-sm font-semibold">Navigasi</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup navigasi"
                  className="rounded border border-border p-1.5"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
