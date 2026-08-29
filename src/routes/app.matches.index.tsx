import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DataTable,
  FilterSelect,
  MetricCard,
  PageHeader,
  StatusBadge,
  statusOptions,
  type Column,
} from "@/components/kit";
import { competitionById, formatDateTime, teamById, venueById } from "@/data/mock";
import { useMockStore } from "@/context/mock-store";
import type { Match } from "@/data/domain";

export const Route = createFileRoute("/app/matches/")({
  head: () => ({
    meta: [
      { title: "Match Operations — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Operasional pertandingan futsal: jadwal, penugasan official, match sheet, laporan, validasi, dan publikasi.",
      },
      { property: "og:title", content: "Match Operations — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "Jadwal, official assignment, dan status laporan setiap pertandingan futsal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchesPage,
});

const columns: Column<Match>[] = [
  {
    key: "fixture",
    header: "Pertandingan",
    render: (m) => (
      <div className="min-w-0">
        <Link
          to="/app/matches/$matchId"
          params={{ matchId: m.id }}
          className="font-medium hover:underline"
        >
          {teamById(m.homeTeamId)?.name} vs {teamById(m.awayTeamId)?.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {competitionById(m.competitionId)?.name} · {m.round}
        </p>
      </div>
    ),
  },
  {
    key: "kickoff",
    header: "Kickoff",
    render: (m) => <span className="whitespace-nowrap">{formatDateTime(m.kickoff)}</span>,
  },
  { key: "venue", header: "Venue", render: (m) => venueById(m.venueId)?.name ?? "—" },
  {
    key: "score",
    header: "Skor",
    render: (m) =>
      m.homeScore === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="font-semibold tabular-nums">
          {m.homeScore} – {m.awayScore}
        </span>
      ),
  },
  {
    key: "officials",
    header: "Official",
    render: (m) => {
      const filled = m.officials.filter((o) => o.refereeId).length;
      return (
        <span
          className={filled === m.officials.length ? "tabular-nums text-success" : "tabular-nums"}
        >
          {filled}/{m.officials.length}
        </span>
      );
    },
  },
  {
    key: "report",
    header: "Laporan",
    render: (m) => <StatusBadge status={m.reportValidated ? "APPROVED" : "DRAFT"} />,
  },
  { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
];

function MatchesPage() {
  const { matches } = useMockStore();
  const [status, setStatus] = useState("ALL");

  const rows = useMemo(
    () => (status === "ALL" ? matches : matches.filter((m) => m.status === status)),
    [matches, status],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Match Operations"
        description="Scheduling → official assignment → match sheet → event recording → laporan → validasi → publikasi."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total fixture" value={matches.length} />
        <MetricCard
          label="Selesai"
          value={matches.filter((m) => m.status === "COMPLETED").length}
          tone="success"
        />
        <MetricCard
          label="Menunggu approval jadwal"
          value={matches.filter((m) => m.status === "SUBMITTED").length}
          tone="warning"
        />
        <MetricCard
          label="Dipublikasikan"
          value={matches.filter((m) => m.published).length}
          tone="primary"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={(m) =>
          `${teamById(m.homeTeamId)?.name} ${teamById(m.awayTeamId)?.name} ${m.round} ${competitionById(m.competitionId)?.name}`
        }
        searchPlaceholder="Cari tim, ronde, kompetisi…"
        filters={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions(["DRAFT", "SUBMITTED", "APPROVED", "ACTIVE", "COMPLETED"])}
          />
        }
      />
    </div>
  );
}
