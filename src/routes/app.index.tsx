import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DataTable,
  MetricCard,
  MockNotice,
  PageHeader,
  SectionCard,
  StatusBadge,
  Timeline,
  type Column,
} from "@/components/kit";
import { roleLabels, useAppState } from "@/context/app-state";
import { useMockStore } from "@/context/mock-store";
import {
  competitions,
  formatDateTime,
  formatIDR,
  people,
  refereeName,
  teamById,
  teams,
} from "@/data/mock";
import type { Match } from "@/data/domain";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Ringkasan operasional peran dan tenant: metrik utama, fixture mendatang, audit trail, antrean perizinan, dan penugasan wasit.",
      },
      { property: "og:title", content: "Dashboard — Futsal Ecosystem" },
      {
        property: "og:description",
        content:
          "Satu halaman untuk seluruh visibility operasional: metrik, jadwal, audit, dan antrean.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role, organizationId, organizationName, actorName } = useAppState();
  const {
    permits,
    matches,
    honoraria,
    audit,
    allReferees,
  } = useMockStore();

  const scopedPermits = permits.filter((p) => p.organizationId === organizationId);
  const scopedMatches = matches.filter((m) => m.organizationId === organizationId);
  const scopedPeople = people.filter((p) => p.organizationId === organizationId);
  const scopedTeams = teams.filter((t) => t.organizationId === organizationId);
  const scopedHonoraria = honoraria.filter((h) => h.organizationId === organizationId);

  const upcoming = scopedMatches.filter((m) => m.status !== "COMPLETED");

  const matchColumns: Column<Match>[] = [
    {
      key: "match",
      header: "Pertandingan",
      render: (m) => (
        <Link to="/app/matches/$matchId" params={{ matchId: m.id }} className="font-medium hover:underline">
          {teamById(m.homeTeamId)?.name} vs {teamById(m.awayTeamId)?.name}
        </Link>
      ),
    },
    { key: "round", header: "Ronde", render: (m) => <span className="text-muted-foreground">{m.round}</span> },
    { key: "kickoff", header: "Kickoff", render: (m) => formatDateTime(m.kickoff) },
    {
      key: "officials",
      header: "Official",
      render: (m) => {
        const filled = m.officials.filter((o) => o.refereeId).length;
        return (
          <span className={filled < 3 ? "text-warning-foreground" : ""}>
            {filled}/{m.officials.length} terisi
          </span>
        );
      },
    },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
  ];

  const roleMetrics = () => {
    if (role === "referee") {
      const myRef = allReferees[0]!;
      const myAssignments = scopedMatches.filter((m) =>
        m.officials.some((o) => o.refereeId === myRef.id),
      );
      const myHon = honoraria.filter((h) => h.refereeId === myRef.id);
      return (
        <>
          <MetricCard label="Penugasan bulan ini" value={myRef.assignmentsThisMonth} hint="Batas kebijakan: 8" />
          <MetricCard label="Pertandingan terjadwal" value={myAssignments.length} />
          <MetricCard
            label="Honorarium menunggu"
            value={formatIDR(myHon.filter((h) => h.status !== "COMPLETED").reduce((s, h) => s + h.amount, 0))}
            tone="warning"
          />
          <MetricCard label="Skor performa" value={`${myRef.performanceScore}/100`} tone="success" />
        </>
      );
    }
    if (role === "team_manager") {
      return (
        <>
          <MetricCard label="Tim dikelola" value={scopedTeams.length} />
          <MetricCard label="Anggota terdaftar" value={scopedPeople.length} />
          <MetricCard
            label="Dokumen menunggu verifikasi"
            value={scopedPeople.flatMap((p) => p.documents).filter((d) => d.status === "PENDING").length}
            tone="warning"
          />
          <MetricCard label="Pertandingan mendatang" value={upcoming.length} />
        </>
      );
    }
    if (role === "event_organizer") {
      return (
        <>
          <MetricCard label="Event / kompetisi" value={competitions.filter((c) => c.organizationId === organizationId).length} />
          <MetricCard label="Pengajuan izin aktif" value={scopedPermits.filter((p) => p.status === "UNDER_REVIEW" || p.status === "SUBMITTED").length} tone="warning" />
          <MetricCard label="Fixture terjadwal" value={upcoming.length} />
          <MetricCard label="Tim peserta" value={scopedTeams.length} />
        </>
      );
    }
    return (
      <>
        <MetricCard label="Anggota terdaftar" value={scopedPeople.length} hint="Person kanonik" />
        <MetricCard label="Wasit aktif" value={allReferees.filter((r) => r.licenseStatus === "ACTIVE").length} tone="success" />
        <MetricCard label="Izin menunggu keputusan" value={permits.filter((p) => p.status === "UNDER_REVIEW").length} tone="warning" />
        <MetricCard
          label="Honorarium belum dibayar"
          value={formatIDR(scopedHonoraria.filter((h) => h.status !== "COMPLETED").reduce((s, h) => s + h.amount, 0))}
        />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dashboard ${roleLabels[role]}`}
        description={`Ringkasan operasional untuk tenant ${organizationName}. Selamat bekerja, ${actorName}.`}
        meta={
          <>
            <StatusBadge status="ACTIVE" />
            <span className="font-mono text-xs text-muted-foreground">tenant: {organizationId}</span>
          </>
        }
      />

      <MockNotice />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{roleMetrics()}</div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Pertandingan mendatang"
          description="Fixture yang menunggu penugasan official atau operasional."
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          <DataTable columns={matchColumns} rows={upcoming} pageSize={5} emptyTitle="Tidak ada fixture mendatang" />
        </SectionCard>

        <SectionCard title="Aktivitas & audit terbaru" description="WHO · WHAT · WHEN · WHY">
          <Timeline
            items={audit.slice(0, 4).map((a) => ({
              at: a.at,
              actor: `${a.actor} (${a.actorRole})`,
              action: a.action,
              note: `${a.resource} ${a.resourceId} — ${a.reason}`,
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Antrean perizinan" description="Lifecycle pengajuan izin event & kompetisi." bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {permits.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    to="/app/licensing/$permitId"
                    params={{ permitId: p.id }}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {p.eventName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.permitType} · {p.requirements.filter((r) => r.fulfilled).length}/
                    {p.requirements.length} requirement
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Penugasan wasit terakhir" description="Assign → confirm → attendance." bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {matches
              .flatMap((m) => m.officials.filter((o) => o.refereeId).map((o) => ({ m, o })))
              .slice(0, 5)
              .map(({ m, o }) => (
                <li key={`${m.id}-${o.role}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{refereeName(o.refereeId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.role.replace(/_/g, " ")} · {teamById(m.homeTeamId)?.name} vs{" "}
                      {teamById(m.awayTeamId)?.name}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
