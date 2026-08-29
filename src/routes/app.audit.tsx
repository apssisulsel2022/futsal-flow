import { createFileRoute } from "@tanstack/react-router";
import { DataTable, MetricCard, PageHeader, type Column } from "@/components/kit";
import { useMockStore } from "@/context/mock-store";
import { orgById } from "@/data/mock";
import type { AuditEntry } from "@/data/domain";

export const Route = createFileRoute("/app/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Append-only log untuk setiap keputusan kritis: approval, rejection, assignment, payment, dan perubahan izin akses.",
      },
      { property: "og:title", content: "Audit Trail — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "WHO · WHAT · WHEN · WHY. Setiap keputusan dapat dijelaskan dan dilacak.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

const columns: Column<AuditEntry>[] = [
  { key: "at", header: "Waktu", render: (a) => <span className="whitespace-nowrap font-mono text-xs">{a.at}</span> },
  {
    key: "actor",
    header: "Actor",
    render: (a) => (
      <div className="min-w-0">
        <p className="font-medium">{a.actor}</p>
        <p className="text-xs text-muted-foreground">{a.actorRole}</p>
      </div>
    ),
  },
  { key: "action", header: "Action", render: (a) => <span className="font-mono text-xs">{a.action}</span> },
  {
    key: "resource",
    header: "Resource",
    render: (a) => (
      <div className="min-w-0">
        <p>{a.resource}</p>
        <p className="font-mono text-xs text-muted-foreground">{a.resourceId}</p>
      </div>
    ),
  },
  {
    key: "change",
    header: "Before → After",
    render: (a) => (
      <span className="text-xs">
        <span className="text-muted-foreground">{a.before ?? "—"}</span>
        {" → "}
        <span className="font-medium">{a.after ?? "—"}</span>
      </span>
    ),
  },
  { key: "reason", header: "Alasan", render: (a) => <span className="text-muted-foreground">{a.reason}</span> },
  { key: "org", header: "Tenant", render: (a) => orgById(a.organizationId)?.shortName ?? a.organizationId },
  { key: "trace", header: "Correlation / IP", render: (a) => (
    <span className="font-mono text-xs text-muted-foreground">{a.correlationId} · {a.ip}</span>
  ) },
];

function AuditPage() {
  const { audit } = useMockStore();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Trail"
        description="Append-only. Setiap approval, rejection, assignment, pembayaran, dan perubahan permission wajib tercatat lengkap dengan actor, alasan, dan correlation ID."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total entri" value={audit.length} />
        <MetricCard label="Keputusan izin" value={audit.filter((a) => a.resource === "PermitApplication").length} />
        <MetricCard label="Penugasan & pertandingan" value={audit.filter((a) => a.resource === "Match").length} />
        <MetricCard label="Transaksi finansial" value={audit.filter((a) => a.resource === "Honorarium").length} />
      </div>

      <DataTable
        columns={columns}
        rows={audit}
        pageSize={15}
        searchKeys={(a) => `${a.actor} ${a.action} ${a.resource} ${a.resourceId} ${a.reason} ${a.correlationId}`}
        searchPlaceholder="Cari actor, action, resource, correlation ID…"
      />
    </div>
  );
}
