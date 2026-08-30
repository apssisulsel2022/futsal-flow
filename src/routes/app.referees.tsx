import { createFileRoute, Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
  type Column,
} from "@/components/kit";
import { formatDate, matches, personById, referees, teamById } from "@/data/mock";
import type { Referee } from "@/data/domain";

export const Route = createFileRoute("/app/referees")({
  head: () => ({
    meta: [
      { title: "Registri Wasit — Futsal Ecosystem" },
      { name: "description", content: "Data wasit, lisensi, tingkatan, dan ketersediaan mingguan untuk penugasan pertandingan." },
      { property: "og:title", content: "Registri Wasit — Futsal Ecosystem" },
      { property: "og:description", content: "Data wasit, lisensi, tingkatan, dan ketersediaan mingguan untuk penugasan pertandingan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RefereesPage,
});

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const columns: Column<Referee>[] = [
  {
    key: "name",
    header: "Wasit",
    render: (r) => (
      <div className="min-w-0">
        <Link to="/app/people/$personId" params={{ personId: r.personId }} className="font-medium hover:underline">
          {personById(r.personId)?.fullName ?? r.personId}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
      </div>
    ),
  },
  { key: "license", header: "Lisensi", render: (r) => <span className="font-mono text-xs">{r.licenseNo}</span> },
  { key: "grade", header: "Grade", render: (r) => r.grade },
  { key: "expires", header: "Berlaku sampai", render: (r) => formatDate(r.licenseExpiresAt) },
  { key: "city", header: "Domisili", render: (r) => `${r.city} · ${r.distanceKm} km` },
  {
    key: "availability",
    header: "Availability",
    render: (r) => (
      <div className="flex gap-0.5">
        {days.map((d) => (
          <span
            key={d}
            title={d}
            className={
              r.availability.includes(d)
                ? "rounded bg-success/15 px-1 py-0.5 text-[9px] font-medium text-success"
                : "rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground"
            }
          >
            {d[0]}
          </span>
        ))}
      </div>
    ),
  },
  { key: "load", header: "Beban bulan ini", render: (r) => <span className="tabular-nums">{r.assignmentsThisMonth}</span> },
  { key: "perf", header: "Performa", render: (r) => <span className="tabular-nums">{r.performanceScore || "—"}</span> },
  { key: "status", header: "Status lisensi", render: (r) => <StatusBadge status={r.licenseStatus} /> },
];

function RefereesPage() {
  const assignments = matches.flatMap((m) =>
    m.officials.filter((o) => o.refereeId).map((o) => ({ match: m, official: o })),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Referee Management"
        description="Registration → qualification → license → availability → eligibility → assignment → confirmation → attendance → performance → honorarium."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Wasit terdaftar" value={referees.length} />
        <MetricCard label="Lisensi aktif" value={referees.filter((r) => r.licenseStatus === "ACTIVE").length} tone="success" />
        <MetricCard label="Menunggu review lisensi" value={referees.filter((r) => r.licenseStatus === "UNDER_REVIEW").length} tone="warning" />
        <MetricCard
          label="Rata-rata performa"
          value={Math.round(
            referees.filter((r) => r.performanceScore).reduce((s, r) => s + r.performanceScore, 0) /
              Math.max(1, referees.filter((r) => r.performanceScore).length),
          )}
        />
      </div>

      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">Registry & lisensi</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="history">Riwayat penugasan</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="mt-4">
          <DataTable
            columns={columns}
            rows={referees}
            searchKeys={(r) => `${personById(r.personId)?.fullName ?? ""} ${r.grade} ${r.city} ${r.licenseNo}`}
            searchPlaceholder="Cari wasit, grade, kota…"
          />
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <SectionCard title="Kalender ketersediaan mingguan" description="Dasar eligibility sebelum penugasan.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 text-xs tracking-wide text-muted-foreground uppercase">Wasit</th>
                    {days.map((d) => (
                      <th key={d} className="px-2 py-2 text-xs tracking-wide text-muted-foreground uppercase">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {referees.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{personById(r.personId)?.fullName}</td>
                      {days.map((d) => (
                        <td key={d} className="px-2 py-2">
                          <span
                            className={
                              r.availability.includes(d)
                                ? "inline-block size-3 rounded bg-success"
                                : "inline-block size-3 rounded bg-muted"
                            }
                            aria-label={r.availability.includes(d) ? "Tersedia" : "Tidak tersedia"}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <DataTable
            rows={assignments}
            rowKey={(a) => `${a.match.id}-${a.official.role}`}
            columns={[
              {
                key: "referee",
                header: "Wasit",
                render: (a) => personById(referees.find((r) => r.id === a.official.refereeId)?.personId ?? "")?.fullName ?? "—",
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
              { key: "round", header: "Ronde", render: (a) => a.match.round },
              { key: "status", header: "Status", render: (a) => <StatusBadge status={a.official.status} /> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
