import { createFileRoute, Link } from "@tanstack/react-router";
import { competitions, matches, publicStandings, publicTopScorers, teamById } from "@/data/mock";
import { DataTable, MetricCard, SectionCard, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Ringkasan Kompetisi — Portal Publik Futsal" },
      {
        name: "description",
        content:
          "Ringkasan kompetisi futsal aktif: jumlah pertandingan terpublikasi, pemuncak klasemen, dan pencetak gol terbanyak.",
      },
      { property: "og:title", content: "Ringkasan Kompetisi — Portal Publik Futsal" },
      {
        property: "og:description",
        content: "Kompetisi aktif, pemuncak klasemen, dan top skor futsal Sulsel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalOverview,
});

function PortalOverview() {
  const published = matches.filter((m) => m.status === "PUBLISHED").length;
  const leader = publicStandings[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Kompetisi aktif" value={competitions.filter((c) => c.status === "ACTIVE").length} />
        <MetricCard label="Hasil terpublikasi" value={published} tone="success" />
        <MetricCard label="Pemuncak klasemen" value={leader?.team ?? "—"} />
      </div>

      <SectionCard title="Kompetisi" description="Kompetisi berlisensi aktif" bodyClassName="p-0">
        <DataTable
          rows={competitions}
          rowKey={(c) => c.id}
          columns={[
            { key: "name", header: "Kompetisi", render: (c) => <span className="font-medium">{c.name}</span> },
            { key: "season", header: "Musim", render: (c) => c.season },
            { key: "category", header: "Kategori", render: (c) => c.category },
            { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          ]}
        />
      </SectionCard>

      <SectionCard title="Top skor" description="Berdasarkan hasil pertandingan tervalidasi" bodyClassName="p-0">
        <DataTable
          rows={publicTopScorers}
          rowKey={(s) => s.player}
          columns={[
            { key: "player", header: "Pemain", render: (s) => <span className="font-medium">{s.player}</span> },
            { key: "team", header: "Tim", render: (s) => s.team },
            { key: "goals", header: "Gol", render: (s) => <span className="tabular-nums font-semibold">{s.goals}</span> },
          ]}
        />
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Lihat detail{" "}
        <Link to="/portal/fixtures" className="underline">
          jadwal & hasil
        </Link>{" "}
        atau{" "}
        <Link to="/portal/standings" className="underline">
          klasemen lengkap
        </Link>
        . Total tim terdaftar: {new Set(publicStandings.map((s) => s.team)).size}, tim tercatat pada sistem:{" "}
        {teamById("team-001")?.name ?? "—"}.
      </p>
    </div>
  );
}
