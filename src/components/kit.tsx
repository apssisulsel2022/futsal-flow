import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Lifecycle } from "@/data/domain";

export function PageHeader({
  title,
  description,
  meta,
  actions,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const lifecycleStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SUBMITTED: "bg-info/10 text-info border-info/30",
  UNDER_REVIEW: "bg-warning/15 text-warning-foreground border-warning/40",
  APPROVED: "bg-success/10 text-success border-success/30",
  ACTIVE: "bg-success/10 text-success border-success/30",
  CONFIRMED: "bg-success/10 text-success border-success/30",
  ATTENDED: "bg-success/10 text-success border-success/30",
  VERIFIED: "bg-success/10 text-success border-success/30",
  COMPLETED: "bg-primary/10 text-primary border-primary/30",
  PUBLISHED: "bg-primary/10 text-primary border-primary/30",
  ASSIGNED: "bg-info/10 text-info border-info/30",
  PENDING: "bg-warning/15 text-warning-foreground border-warning/40",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/30",
  DECLINED: "bg-destructive/10 text-destructive border-destructive/30",
  RESUBMITTED: "bg-info/10 text-info border-info/30",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
  UNASSIGNED: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = lifecycleStyles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        style,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export const lifecycleOrder: Lifecycle[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
];

export function LifecycleTrack({ current }: { current: Lifecycle }) {
  const rejected = current === "REJECTED" || current === "RESUBMITTED";
  const activeIndex = lifecycleOrder.indexOf(current);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {lifecycleOrder.map((step, i) => {
        const done = !rejected && activeIndex >= 0 && i <= activeIndex;
        return (
          <span
            key={step}
            className={cn(
              "rounded border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
              done
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {step.replace(/_/g, " ")}
          </span>
        );
      })}
      {rejected ? <StatusBadge status={current} /> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "warning" | "success" | "destructive";
}) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    warning: "text-warning-foreground",
    success: "text-success",
    destructive: "text-destructive",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm break-words">{value ?? "—"}</dd>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { at: string; actor: string; action: string; note?: string }[];
}) {
  if (!items.length) return <EmptyState title="Belum ada aktivitas" />;
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={`${item.at}-${i}`} className="relative pl-6">
          <span className="absolute top-1.5 left-0 size-2 rounded-full bg-primary" aria-hidden />
          {i < items.length - 1 ? (
            <span className="absolute top-4 left-[3px] h-full w-px bg-border" aria-hidden />
          ) : null}
          <p className="text-sm font-medium">{item.action.replace(/_/g, " ")}</p>
          <p className="text-xs text-muted-foreground">
            {item.actor} · {item.at}
          </p>
          {item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  searchKeys,
  searchPlaceholder = "Cari…",
  filters,
  emptyTitle = "Tidak ada data",
  rowKey,
  pageSize = 10,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  emptyTitle?: string;
  rowKey?: (row: T) => string;
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim() || !searchKeys) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKeys(r).toLowerCase().includes(q));
  }, [query, rows, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  return (
    <div className="rounded-md border border-border bg-card">
      {searchKeys || filters ? (
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
          {searchKeys ? (
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search
                className="absolute top-2.5 left-2.5 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}
          {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyTitle}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row) : ((row as { id?: string }).id ?? i)}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-2.5 align-middle", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize ? (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            {currentPage * pageSize + 1}–{Math.min(filtered.length, (currentPage + 1) * pageSize)}{" "}
            dari {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
              disabled={currentPage >= pageCount - 1}
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MockNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      {children ??
        "Data contoh (mock). Aksi di halaman ini belum tersambung ke backend; enforcement sesungguhnya akan berada di database/API."}
    </p>
  );
}
