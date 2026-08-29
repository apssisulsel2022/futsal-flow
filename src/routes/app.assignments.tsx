import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/kit";
import {
  competitionById,
  formatDateTime,
  matches,
  personById,
  referees,
  teamById,
} from "@/data/mock";

export const Route = createFileRoute("/app/assignments")({
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const openSlots = matches.flatMap((m) =>
    m.officials
      .filter((o) => !o.refereeId && m.status !== "COMPLETED")
      .map((o) => ({ id: `${m.id}-${o.role}`, match: m, official: o })),
  );
  const assigned = matches.flatMap((m) =>
    m.officials.filter((o) => o.refereeId).map((o) => ({ id: `${m.id}-${o.role}`, match: m, official: o })),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Referee Assignment"
        description="Slot official per pertandingan, eligibility berbasis lisensi, availability, beban kerja, dan conflict of interest."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Slot terbuka" value={openSlots.length} tone="warning" />
        <MetricCard label="Sudah ditugaskan" value={assigned.length} />
        <MetricCard label="Menunggu konfirmasi" value={assigned.filter((a) => a.official.status === "ASSIGNED").length} />
        <MetricCard label="Dikonfirmasi" value={assigned.filter((a) => a.official.status === "CONFIRMED").length} tone="success" />
      </div>

      <SectionCard
        title="Slot official yang belum terisi"
        description="Penugasan hanya menawarkan wasit yang lolos aturan eligibility."
        bodyClassName="p-0"
      >
        {openSlots.length ? (
          <ul className="divide-y divide-border">
            {openSlots.map((s) => {
              const eligible = referees.filter(
                (r) =>
                  r.licenseStatus === "ACTIVE" &&
                  !r.conflictOrganizationIds.includes(s.match.organizationId) &&
                  r.assignmentsThisMonth < 8,
              );
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/app/matches/$matchId"
                      params={{ matchId: s.match.id }}
                      className="text-sm font-medium hover:underline"
                    >
                      {teamById(s.match.homeTeamId)?.name} vs {teamById(s.match.awayTeamId)?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.official.role.replace(/_/g, " ")} · {formatDateTime(s.match.kickoff)} ·{" "}
                      {competitionById(s.match.competitionId)?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{eligible.length} wasit eligible</span>
                    <Button size="sm" variant="outline" disabled={!eligible.length}>
                      Tugaskan
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4">
            <EmptySlots />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Eligibility pool" description="Aturan: lisensi aktif, tanpa conflict of interest, maksimal 8 penugasan per bulan." bodyClassName="p-0">
        <DataTable
          rows={referees}
          columns={[
            {
              key: "name",
              header: "Wasit",
              render: (r) => (
                <Link to="/app/people/$personId" params={{ personId: r.personId }} className="font-medium hover:underline">
                  {personById(r.personId)?.fullName}
                </Link>
              ),
            },
            { key: "grade", header: "Grade", render: (r) => r.grade },
            { key: "license", header: "Lisensi", render: (r) => <StatusBadge status={r.licenseStatus} /> },
            { key: "load", header: "Beban", render: (r) => <span className="tabular-nums">{r.assignmentsThisMonth}/8</span> },
            { key: "distance", header: "Jarak", render: (r) => `${r.distanceKm} km` },
            {
              key: "conflict",
              header: "Conflict",
              render: (r) => (r.conflictOrganizationIds.length ? r.conflictOrganizationIds.join(", ") : "—"),
            },
            {
              key: "eligible",
              header: "Eligible",
              render: (r) => (
                <StatusBadge
                  status={
                    r.licenseStatus === "ACTIVE" && r.assignmentsThisMonth < 8 ? "APPROVED" : "REJECTED"
                  }
                />
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Penugasan aktif" bodyClassName="p-0">
        <DataTable
          rows={assigned}
          columns={[
            {
              key: "referee",
              header: "Wasit",
              render: (a) =>
                personById(referees.find((r) => r.id === a.official.refereeId)?.personId ?? "")?.fullName ?? "—",
            },
            { key: "role", header: "Peran", render: (a) => a.official.role.replace(/_/g, " ") },
            {
              key: "match",
              header: "Pertandingan",
              render: (a) => (
                <Link to="/app/matches/$matchId" params={{ matchId: a.match.id }} className="hover:underline">
                  {teamById(a.match.homeTeamId)?.name} vs {teamById(a.match.awayTeamId)?.name}
                </Link>
              ),
            },
            { key: "kickoff", header: "Kickoff", render: (a) => formatDateTime(a.match.kickoff) },
            { key: "status", header: "Status", render: (a) => <StatusBadge status={a.official.status} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function EmptySlots() {
  return (
    <div className="rounded-md border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium">Semua slot official sudah terisi</p>
    </div>
  );
}
