import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  MetricCard,
  PageHeader,
  StatusBadge,
  type Column,
} from "@/components/kit";
import { formatDate, orgById, permits, venueById } from "@/data/mock";
import type { PermitApplication } from "@/data/domain";

export const Route = createFileRoute("/app/licensing/")({
  component: LicensingPage,
});

const columns: Column<PermitApplication>[] = [
  {
    key: "event",
    header: "Event",
    render: (p) => (
      <div className="min-w-0">
        <Link to="/app/licensing/$permitId" params={{ permitId: p.id }} className="font-medium hover:underline">
          {p.eventName}
        </Link>
        <p className="text-xs text-muted-foreground">{p.permitType}</p>
      </div>
    ),
  },
  {
    key: "permitNo",
    header: "No. izin",
    render: (p) => <span className="font-mono text-xs">{p.permitNo ?? "—"}</span>,
  },
  { key: "org", header: "Pemohon", render: (p) => orgById(p.organizationId)?.shortName ?? p.organizationId },
  { key: "venue", header: "Venue", render: (p) => venueById(p.venueId)?.name ?? "—" },
  {
    key: "period",
    header: "Periode",
    render: (p) => (
      <span className="whitespace-nowrap">
        {formatDate(p.startDate)} – {formatDate(p.endDate)}
      </span>
    ),
  },
  {
    key: "req",
    header: "Requirement",
    render: (p) => {
      const done = p.requirements.filter((r) => r.fulfilled).length;
      return (
        <span className={done === p.requirements.length ? "text-success tabular-nums" : "tabular-nums"}>
          {done}/{p.requirements.length}
        </span>
      );
    },
  },
  { key: "reviewer", header: "Reviewer", render: (p) => p.reviewer ?? "—" },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
];

function LicensingPage() {
  const count = (s: string) => permits.filter((p) => p.status === s).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Licensing & Permit"
        description="Draft → submit → verifikasi requirement → keputusan → penerbitan izin. Setiap keputusan wajib memiliki alasan dan tercatat di audit trail."
        actions={<Button size="sm">Ajukan izin</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Draft" value={count("DRAFT")} />
        <MetricCard label="Dalam review" value={count("UNDER_REVIEW")} tone="warning" hint="SLA 5 hari kerja" />
        <MetricCard label="Disetujui" value={count("APPROVED")} tone="success" />
        <MetricCard label="Ditolak" value={count("REJECTED")} tone="destructive" />
      </div>

      <DataTable
        columns={columns}
        rows={permits}
        searchKeys={(p) => `${p.eventName} ${p.permitType} ${p.permitNo ?? ""} ${p.status}`}
        searchPlaceholder="Cari event, tipe izin, nomor…"
      />
    </div>
  );
}
