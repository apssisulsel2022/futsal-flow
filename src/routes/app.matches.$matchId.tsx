import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  EmptyState,
  Field,
  LifecycleTrack,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/kit";
import {
  competitionById,
  formatDateTime,
  matchById,
  refereeName,
  teamById,
  venueById,
} from "@/data/mock";

export const Route = createFileRoute("/app/matches/$matchId")({
  loader: ({ params }) => {
    const match = matchById(params.matchId);
    if (!match) throw notFound();
    return { match };
  },
  errorComponent: () => <EmptyState title="Pertandingan gagal dimuat" />,
  notFoundComponent: () => <EmptyState title="Pertandingan tidak ditemukan" />,
  component: MatchDetail,
});

function MatchDetail() {
  const { match } = Route.useLoaderData();
  const home = teamById(match.homeTeamId);
  const away = teamById(match.awayTeamId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${home?.name} vs ${away?.name}`}
        description={`${competitionById(match.competitionId)?.name} · ${match.round} · ${venueById(match.venueId)?.name}`}
        meta={
          <>
            <StatusBadge status={match.status} />
            <StatusBadge status={match.published ? "ACTIVE" : "DRAFT"} />
            <span className="font-mono text-xs text-muted-foreground">{match.id}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/matches">Kembali</Link>
            </Button>
            <Button size="sm" disabled={match.reportValidated}>
              {match.reportValidated ? "Laporan tervalidasi" : "Validasi laporan"}
            </Button>
          </>
        }
      />

      <LifecycleTrack current={match.status} />

      <div className="grid gap-4 sm:grid-cols-3">
        <SectionCard className="sm:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 text-center flex-1">
              <p className="truncate text-sm font-medium">{home?.name}</p>
              <p className="text-xs text-muted-foreground">Tuan rumah</p>
            </div>
            <p className="text-3xl font-semibold tabular-nums">
              {match.homeScore ?? "–"} : {match.awayScore ?? "–"}
            </p>
            <div className="min-w-0 text-center flex-1">
              <p className="truncate text-sm font-medium">{away?.name}</p>
              <p className="text-xs text-muted-foreground">Tamu</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5 border-t border-border pt-4 sm:grid-cols-4">
            <Field label="Kickoff" value={formatDateTime(match.kickoff)} />
            <Field label="Akumulasi foul" value={`${match.teamFouls.home} – ${match.teamFouls.away}`} />
            <Field label="Timeout" value={`${match.timeouts.home} – ${match.timeouts.away}`} />
            <Field label="Regulasi" value={competitionById(match.competitionId)?.regulationCode ?? "—"} />
          </dl>
        </SectionCard>

        <SectionCard title="Match officials" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {match.officials.map((o) => (
              <li key={o.role} className="flex items-center justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm">{refereeName(o.refereeId) || "Belum ditugaskan"}</p>
                  <p className="text-xs text-muted-foreground">{o.role.replace(/_/g, " ")}</p>
                </div>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Event log</TabsTrigger>
          <TabsTrigger value="lineup">Match sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          {match.events.length ? (
            <DataTable
              rows={match.events}
              pageSize={20}
              columns={[
                { key: "min", header: "Menit", render: (e) => <span className="tabular-nums">{e.minute}'</span> },
                { key: "half", header: "Babak", render: (e) => `Babak ${e.half}` },
                { key: "type", header: "Event", render: (e) => <span className="font-medium">{e.type.replace(/_/g, " ")}</span> },
                { key: "team", header: "Tim", render: (e) => (e.team === "HOME" ? home?.name : away?.name) },
                { key: "person", header: "Person", render: (e) => e.personName },
                { key: "detail", header: "Detail", render: (e) => <span className="text-muted-foreground">{e.detail ?? "—"}</span> },
              ]}
            />
          ) : (
            <EmptyState
              title="Belum ada event tercatat"
              description="Event recording tersedia setelah pertandingan dimulai."
            />
          )}
        </TabsContent>

        <TabsContent value="lineup" className="mt-4">
          {match.lineup.home.length || match.lineup.away.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(["home", "away"] as const).map((side) => (
                <SectionCard
                  key={side}
                  title={side === "home" ? (home?.name ?? "Home") : (away?.name ?? "Away")}
                  bodyClassName="p-0"
                >
                  <ul className="divide-y divide-border">
                    {match.lineup[side].map((p) => (
                      <li key={p.number} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="w-7 text-center font-mono text-xs text-muted-foreground">{p.number}</span>
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{p.role}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ))}
            </div>
          ) : (
            <EmptyState title="Match sheet belum diisi" description="Lineup dikunci sebelum kickoff." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
