import { createFileRoute, Link } from "@tanstack/react-router";
import { competitions, publicStandings, matches, teamById, venueById } from "@/data/mock";
import { DataTable, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal Publik Futsal — Klasemen & Jadwal" },
      {
        name: "description",
        content:
          "Portal publik ekosistem futsal: klasemen resmi, jadwal pertandingan, dan daftar kompetisi terverifikasi.",
      },
      { property: "og:title", content: "Portal Publik Futsal — Klasemen & Jadwal" },
      {
        property: "og:description",
        content: "Klasemen resmi, jadwal pertandingan, dan kompetisi futsal terverifikasi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <PageHeader
        title="Portal Publik"
        description="Data read-only yang dipublikasikan dari hasil pertandingan tervalidasi."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app">Masuk ke platform</Link>
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <SectionCard title="Klasemen" description="Liga Futsal Sulsel 2026" bodyClassName="p-0">
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
              {
                key: "pts",
                header: "Poin",
                render: (s) => <span className="font-semibold tabular-nums">{s.pts}</span>,
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Jadwal & Hasil" description="Pertandingan terbaru" bodyClassName="p-0">
          <DataTable
            rows={matches}
            rowKey={(m) => m.id}
            columns={[
              { key: "date", header: "Tanggal", render: (m) => m.kickoff.slice(0, 10) },
              {
                key: "teams",
                header: "Pertandingan",
                render: (m) => (
                  <span className="font-medium">
                    {teamById(m.homeTeamId)?.name ?? m.homeTeamId} vs{" "}
                    {teamById(m.awayTeamId)?.name ?? m.awayTeamId}
                  </span>
                ),
              },
              { key: "venue", header: "Venue", render: (m) => venueById(m.venueId)?.name ?? m.venueId },
              { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
            ]}
          />
        </SectionCard>

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
      </div>
    </div>
  );
}
