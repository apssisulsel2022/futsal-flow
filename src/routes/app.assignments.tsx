import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  EmptyState,
  FilterSelect,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/kit";
import {
  competitionById,
  formatDateTime,
  personById,
  referees,
  refereeName,
  teamById,
} from "@/data/mock";
import { evaluateEligibility, useMockStore } from "@/context/mock-store";
import type { Match, MatchOfficialAssignment } from "@/data/domain";

export const Route = createFileRoute("/app/assignments")({
  head: () => ({
    meta: [
      { title: "Referee Assignment — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Penugasan wasit berbasis eligibility: lisensi aktif, availability, beban kerja, dan bebas conflict of interest.",
      },
      { property: "og:title", content: "Referee Assignment — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "Assign → confirm → attendance dengan pemblokiran otomatis wasit tidak eligible.",
      },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { matches, assignOfficial, advanceOfficial, clearOfficial } = useMockStore();
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openSlots = matches.flatMap((m) =>
    m.officials
      .filter((o) => !o.refereeId && m.status !== "COMPLETED")
      .map((o) => ({ id: `${m.id}-${o.role}`, match: m, official: o })),
  );
  const assigned = matches.flatMap((m) =>
    m.officials
      .filter((o) => o.refereeId)
      .map((o) => ({ id: `${m.id}-${o.role}`, match: m, official: o })),
  );

  const assignedRows = useMemo(
    () =>
      statusFilter === "ALL"
        ? assigned
        : assigned.filter((a) => a.official.status === statusFilter),
    [assigned, statusFilter],
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
        <MetricCard
          label="Menunggu konfirmasi"
          value={assigned.filter((a) => a.official.status === "ASSIGNED").length}
        />
        <MetricCard
          label="Hadir tercatat"
          value={assigned.filter((a) => a.official.status === "ATTENDED").length}
          tone="success"
        />
      </div>

      <SectionCard
        title="Slot official yang belum terisi"
        description="Penugasan hanya menawarkan wasit yang lolos aturan eligibility."
        bodyClassName="p-0"
      >
        {openSlots.length ? (
          <ul className="divide-y divide-border">
            {openSlots.map((s) => {
              const ranked = referees
                .map((r) => ({ referee: r, ...evaluateEligibility(r.id, s.match) }))
                .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
              const eligible = ranked.filter((r) => r.eligible);
              const expanded = openSlot === s.id;

              return (
                <li key={s.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                      <span className="text-xs text-muted-foreground">
                        {eligible.length} wasit eligible
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!eligible.length}
                        onClick={() => setOpenSlot(expanded ? null : s.id)}
                      >
                        {expanded ? "Tutup" : "Tugaskan"}
                      </Button>
                    </div>
                  </div>

                  {expanded ? (
                    <ul className="mt-3 space-y-2 rounded-md border border-border bg-muted/30 p-2">
                      {ranked.map((r) => (
                        <li
                          key={r.referee.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {personById(r.referee.personId)?.fullName ?? r.referee.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.referee.grade} · skor rekomendasi {r.score}
                              {r.reasons.length ? ` · ${r.reasons.join(", ")}` : ""}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={!r.eligible}
                            onClick={() => {
                              assignOfficial(s.match.id, s.official.role, r.referee.id);
                              setOpenSlot(null);
                            }}
                          >
                            {r.eligible ? "Pilih" : "Tidak eligible"}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState title="Semua slot official sudah terisi" />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Eligibility pool"
        description="Aturan: lisensi aktif, tanpa conflict of interest, maksimal 8 penugasan per bulan."
        bodyClassName="p-0"
      >
        <DataTable
          rows={referees}
          columns={[
            {
              key: "name",
              header: "Wasit",
              render: (r) => (
                <Link
                  to="/app/people/$personId"
                  params={{ personId: r.personId }}
                  className="font-medium hover:underline"
                >
                  {personById(r.personId)?.fullName}
                </Link>
              ),
            },
            { key: "grade", header: "Grade", render: (r) => r.grade },
            {
              key: "license",
              header: "Lisensi",
              render: (r) => <StatusBadge status={r.licenseStatus} />,
            },
            {
              key: "load",
              header: "Beban",
              render: (r) => <span className="tabular-nums">{r.assignmentsThisMonth}/8</span>,
            },
            { key: "distance", header: "Jarak", render: (r) => `${r.distanceKm} km` },
            {
              key: "conflict",
              header: "Conflict",
              render: (r) =>
                r.conflictOrganizationIds.length ? r.conflictOrganizationIds.join(", ") : "—",
            },
            {
              key: "eligible",
              header: "Eligible",
              render: (r) => (
                <StatusBadge
                  status={
                    r.licenseStatus === "ACTIVE" && r.assignmentsThisMonth < 8
                      ? "APPROVED"
                      : "REJECTED"
                  }
                />
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Penugasan aktif" bodyClassName="p-0">
        <DataTable
          rows={assignedRows}
          rowKey={(a) => a.id}
          filters={
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "ALL", label: "Semua status" },
                { value: "ASSIGNED", label: "ASSIGNED" },
                { value: "CONFIRMED", label: "CONFIRMED" },
                { value: "ATTENDED", label: "ATTENDED" },
              ]}
            />
          }
          searchKeys={(a) =>
            `${refereeName(a.official.refereeId)} ${a.official.role} ${a.official.status}`
          }
          searchPlaceholder="Cari wasit, peran, status…"
          columns={[
            {
              key: "referee",
              header: "Wasit",
              render: (a) => refereeName(a.official.refereeId) || "—",
            },
            { key: "role", header: "Peran", render: (a) => a.official.role.replace(/_/g, " ") },
            {
              key: "match",
              header: "Pertandingan",
              render: (a) => (
                <Link
                  to="/app/matches/$matchId"
                  params={{ matchId: a.match.id }}
                  className="hover:underline"
                >
                  {teamById(a.match.homeTeamId)?.name} vs {teamById(a.match.awayTeamId)?.name}
                </Link>
              ),
            },
            {
              key: "kickoff",
              header: "Kickoff",
              render: (a) => (
                <span className="whitespace-nowrap">{formatDateTime(a.match.kickoff)}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (a) => <StatusBadge status={a.official.status} />,
            },
            {
              key: "actions",
              header: "Aksi",
              render: (a) => (
                <SlotActions
                  match={a.match}
                  official={a.official}
                  onAdvance={() => advanceOfficial(a.match.id, a.official.role)}
                  onClear={() => clearOfficial(a.match.id, a.official.role)}
                />
              ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function SlotActions({
  match,
  official,
  onAdvance,
  onClear,
}: {
  match: Match;
  official: MatchOfficialAssignment;
  onAdvance: () => void;
  onClear: () => void;
}) {
  const nextLabel =
    official.status === "ASSIGNED"
      ? "Konfirmasi"
      : official.status === "CONFIRMED"
        ? "Catat kehadiran"
        : null;
  const locked = match.reportValidated;

  return (
    <div className="flex flex-wrap gap-1.5">
      {nextLabel ? (
        <Button size="sm" variant="outline" disabled={locked} onClick={onAdvance}>
          {nextLabel}
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" disabled={locked} onClick={onClear}>
        Batalkan
      </Button>
    </div>
  );
}
