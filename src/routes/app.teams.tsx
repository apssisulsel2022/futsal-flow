import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DataTable, MetricCard, PageHeader, StatusBadge, type Column } from "@/components/kit";
import { orgById, teams } from "@/data/mock";
import type { Team } from "@/data/domain";

export const Route = createFileRoute("/app/teams")({
  component: TeamsPage,
});

const columns: Column<Team>[] = [
  {
    key: "name",
    header: "Tim",
    render: (t) => (
      <div className="min-w-0">
        <p className="font-medium">{t.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{t.id}</p>
      </div>
    ),
  },
  {
    key: "org",
    header: "Organisasi",
    render: (t) => (
      <Link to="/app/organizations/$orgId" params={{ orgId: t.organizationId }} className="hover:underline">
        {orgById(t.organizationId)?.shortName ?? t.organizationId}
      </Link>
    ),
  },
  { key: "category", header: "Kategori", render: (t) => t.category },
  { key: "city", header: "Kota", render: (t) => t.city },
  { key: "squad", header: "Skuad", render: (t) => <span className="tabular-nums">{t.squadSize}</span> },
  { key: "status", header: "Registrasi", render: (t) => <StatusBadge status={t.registrationStatus} /> },
];

function TeamsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Teams"
        description="Registrasi tim dan skuad. Setiap anggota skuad merujuk ke satu Person, sehingga tidak ada duplikasi identitas antar tim."
        actions={<Button size="sm">Registrasi tim</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total tim" value={teams.length} />
        <MetricCard label="Aktif" value={teams.filter((t) => t.registrationStatus === "ACTIVE").length} tone="success" />
        <MetricCard label="Menunggu review" value={teams.filter((t) => t.registrationStatus === "UNDER_REVIEW" || t.registrationStatus === "SUBMITTED").length} tone="warning" />
        <MetricCard label="Total pemain terdaftar" value={teams.reduce((s, t) => s + t.squadSize, 0)} />
      </div>

      <DataTable
        columns={columns}
        rows={teams}
        searchKeys={(t) => `${t.name} ${t.city} ${t.category}`}
        searchPlaceholder="Cari tim, kota, kategori…"
      />
    </div>
  );
}
