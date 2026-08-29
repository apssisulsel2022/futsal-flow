import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DataTable, PageHeader, StatusBadge, type Column } from "@/components/kit";
import { formatDate, organizations } from "@/data/mock";
import type { Organization } from "@/data/domain";

export const Route = createFileRoute("/app/organizations/")({
  component: OrganizationsPage,
});

const columns: Column<Organization>[] = [
  {
    key: "name",
    header: "Organisasi",
    render: (o) => (
      <div className="min-w-0">
        <Link
          to="/app/organizations/$orgId"
          params={{ orgId: o.id }}
          className="font-medium hover:underline"
        >
          {o.name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">
          {o.id} · {o.shortName}
        </p>
      </div>
    ),
  },
  {
    key: "type",
    header: "Tipe",
    render: (o) => <span className="text-xs tracking-wide uppercase">{o.type.replace(/_/g, " ")}</span>,
  },
  { key: "region", header: "Wilayah", render: (o) => o.region },
  {
    key: "parent",
    header: "Parent",
    render: (o) => (
      <span className="font-mono text-xs text-muted-foreground">{o.parentId ?? "root"}</span>
    ),
  },
  { key: "members", header: "Anggota", render: (o) => <span className="tabular-nums">{o.memberCount}</span> },
  { key: "teams", header: "Tim", render: (o) => <span className="tabular-nums">{o.teamCount}</span> },
  { key: "verified", header: "Diverifikasi", render: (o) => formatDate(o.verifiedAt ?? "—") },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
];

function OrganizationsPage() {
  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Organization adalah tenant root. Seluruh data operasional dimiliki oleh satu organisasi dan dapat ditelusuri secara deterministic."
        actions={
          <Button asChild size="sm">
            <Link to="/app/organizations/new">Buat organisasi</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={organizations}
        searchKeys={(o) => `${o.name} ${o.shortName} ${o.region} ${o.type} ${o.id}`}
        searchPlaceholder="Cari nama, wilayah, tipe…"
      />
    </div>
  );
}
