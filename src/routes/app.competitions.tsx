import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DataTable, MetricCard, PageHeader, SectionCard, StatusBadge, type Column } from "@/components/kit";
import { competitions, matches, orgById, publicStandings } from "@/data/mock";
import type { Competition } from "@/data/domain";

export const Route = createFileRoute("/app/competitions")({
  component: CompetitionsPage,
});

const columns: Column<Competition>[] = [
  {
    key: "name",
    header: "Kompetisi",
    render: (c) => (
      <div className="min-w-0">
        <p className="font-medium">{c.name}</p>
        <p className="text-xs text-muted-foreground">
          Musim {c.season} · {c.format.replace(/_/g, " ").toLowerCase()}
        </p>
      </div>
    ),
  },
  { key: "org", header: "Penyelenggara", render: (c) => orgById(c.organizationId)?.shortName ?? c.organizationId },
  { key: "category", header: "Kategori", render: (c) => c.category },
  { key: "teams", header: "Tim", render: (c) => <span className="tabular-nums">{c.teamCount}</span> },
  {
    key: "matches",
    header: "Pertandingan",
    render: (c) => (
      <span className="tabular-nums">
        {matches.filter((m) => m.competitionId === c.id).length}/{c.matchCount}
      </span>
    ),
  },
  { key: "reg", header: "Regulasi", render: (c) => <span className="font-mono text-xs">{c.regulationCode}</span> },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
];

function CompetitionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Competitions"
        description="Struktur kompetisi, regulasi berversi, dan fixture. Klasemen dihitung dari pertandingan yang laporannya sudah tervalidasi."
        actions={<Button size="sm">Buat kompetisi</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Kompetisi" value={competitions.length} />
        <MetricCard label="Aktif" value={competitions.filter((c) => c.status === "ACTIVE").length} tone="success" />
        <MetricCard label="Menunggu review" value={competitions.filter((c) => c.status === "UNDER_REVIEW").length} tone="warning" />
        <MetricCard label="Fixture terjadwal" value={matches.length} />
      </div>

      <DataTable
        columns={columns}
        rows={competitions}
        searchKeys={(c) => `${c.name} ${c.season} ${c.category} ${c.regulationCode}`}
        searchPlaceholder="Cari kompetisi, musim, kategori…"
      />

      <SectionCard
        title="Klasemen — Liga Futsal Sulsel 2026"
        description="Read model dari hasil pertandingan tervalidasi."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/portal">Lihat portal publik</Link>
          </Button>
        }
        bodyClassName="p-0"
      >
        <DataTable
          rows={publicStandings}
          rowKey={(s) => s.team}
          columns={[
            { key: "pos", header: "#", render: (s) => <span className="tabular-nums">{s.pos}</span> },
            { key: "team", header: "Tim", render: (s) => <span className="font-medium">{s.team}</span> },
            { key: "p", header: "M", render: (s) => <span className="tabular-nums">{s.p}</span> },
            { key: "w", header: "Mn", render: (s) => <span className="tabular-nums">{s.w}</span> },
            { key: "d", header: "S", render: (s) => <span className="tabular-nums">{s.d}</span> },
            { key: "l", header: "K", render: (s) => <span className="tabular-nums">{s.l}</span> },
            { key: "gf", header: "GM", render: (s) => <span className="tabular-nums">{s.gf}</span> },
            { key: "ga", header: "GK", render: (s) => <span className="tabular-nums">{s.ga}</span> },
            { key: "pts", header: "Poin", render: (s) => <span className="font-semibold tabular-nums">{s.pts}</span> },
          ]}
        />
      </SectionCard>
    </div>
  );
}
