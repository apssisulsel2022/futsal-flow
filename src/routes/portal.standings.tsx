import { createFileRoute } from "@tanstack/react-router";
import { publicStandings } from "@/data/mock";
import { DataTable, SectionCard } from "@/components/kit";

export const Route = createFileRoute("/portal/standings")({
  head: () => ({
    meta: [
      { title: "Klasemen Resmi — Portal Publik Futsal" },
      {
        name: "description",
        content:
          "Klasemen resmi Liga Futsal Sulsel 2026 dihitung dari hasil pertandingan yang telah divalidasi dan dipublikasikan.",
      },
      { property: "og:title", content: "Klasemen Resmi — Portal Publik Futsal" },
      {
        property: "og:description",
        content: "Klasemen resmi Liga Futsal Sulsel 2026 dari hasil pertandingan tervalidasi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalStandings,
});

function PortalStandings() {
  return (
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
  );
}
