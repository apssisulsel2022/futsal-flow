import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { matches, teamById, venueById, formatDateTime } from "@/data/mock";
import { DataTable, FilterSelect, SectionCard, StatusBadge, statusOptions } from "@/components/kit";

export const Route = createFileRoute("/portal/fixtures")({
  head: () => ({
    meta: [
      { title: "Jadwal & Hasil Pertandingan — Portal Publik Futsal" },
      {
        name: "description",
        content:
          "Jadwal pertandingan futsal dan hasil resmi yang telah divalidasi, lengkap dengan venue dan status publikasi.",
      },
      { property: "og:title", content: "Jadwal & Hasil Pertandingan — Portal Publik Futsal" },
      {
        property: "og:description",
        content: "Jadwal dan hasil pertandingan futsal resmi beserta venue dan status publikasi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalFixtures,
});

function PortalFixtures() {
  const [status, setStatus] = useState("ALL");
  const rows = matches.filter((m) => status === "ALL" || m.status === status);

  return (
    <SectionCard title="Jadwal & Hasil" description="Pertandingan pada musim berjalan" bodyClassName="p-0">
      <DataTable
        rows={rows}
        rowKey={(m) => m.id}
        searchKeys={(m) =>
          `${teamById(m.homeTeamId)?.name ?? ""} ${teamById(m.awayTeamId)?.name ?? ""} ${venueById(m.venueId)?.name ?? ""}`
        }
        searchPlaceholder="Cari tim atau venue…"
        filters={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions(["SCHEDULED", "LIVE", "COMPLETED", "VALIDATED", "PUBLISHED"])}
          />
        }
        columns={[
          { key: "date", header: "Waktu", render: (m) => formatDateTime(m.kickoff) },
          {
            key: "teams",
            header: "Pertandingan",
            render: (m) => (
              <span className="font-medium">
                {teamById(m.homeTeamId)?.name ?? m.homeTeamId} vs {teamById(m.awayTeamId)?.name ?? m.awayTeamId}
              </span>
            ),
          },
          {
            key: "score",
            header: "Skor",
            render: (m) =>
              m.status === "PUBLISHED" || m.status === "VALIDATED" || m.status === "COMPLETED" ? (
                <span className="font-semibold tabular-nums">
                  {m.homeScore} – {m.awayScore}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          { key: "venue", header: "Venue", render: (m) => venueById(m.venueId)?.name ?? m.venueId },
          { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
        ]}
      />
    </SectionCard>
  );
}
