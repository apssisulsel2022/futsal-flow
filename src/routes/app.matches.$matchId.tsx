import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  Field,
  LifecycleTrack,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/kit";
import { competitionById, formatDateTime, referees, refereeName, teamById, venueById } from "@/data/mock";
import { useMockStore } from "@/context/mock-store";
import type { MatchEventType } from "@/data/domain";

export const Route = createFileRoute("/app/matches/$matchId")({
  head: () => ({
    meta: [
      { title: "Match Sheet & Event Log — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Match sheet futsal: pencatatan event, official assignment, validasi laporan, dan publikasi hasil.",
      },
      { property: "og:title", content: "Match Sheet & Event Log — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "Event recording, validasi laporan, dan publikasi hasil pertandingan futsal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <EmptyState title="Pertandingan gagal dimuat" />,
  notFoundComponent: () => <EmptyState title="Pertandingan tidak ditemukan" />,
  component: MatchDetail,
});

const eventTypes: MatchEventType[] = [
  "GOAL",
  "OWN_GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SUBSTITUTION",
  "TIMEOUT",
  "ACCUMULATED_FOUL",
];

function MatchDetail() {
  const { matchId } = Route.useParams();
  const {
    matchById,
    addMatchEvent,
    removeMatchEvent,
    validateMatchReport,
    publishMatch,
    assignOfficial,
    advanceOfficial,
    clearOfficial,
  } = useMockStore();
  const match = matchById(matchId);

  const [minute, setMinute] = useState("1");
  const [half, setHalf] = useState<"1" | "2">("1");
  const [type, setType] = useState<MatchEventType>("GOAL");
  const [team, setTeam] = useState<"HOME" | "AWAY">("HOME");
  const [personName, setPersonName] = useState("");
  const [detail, setDetail] = useState("");

  if (!match) return <EmptyState title="Pertandingan tidak ditemukan" />;

  const home = teamById(match.homeTeamId);
  const away = teamById(match.awayTeamId);
  const locked = match.reportValidated;
  const officialsComplete = match.officials.every((o) => o.refereeId);

  const submitEvent = () => {
    if (!personName.trim()) return;
    addMatchEvent(match.id, {
      minute: Math.max(1, Number(minute) || 1),
      half: half === "2" ? 2 : 1,
      type,
      team,
      personName: personName.trim(),
      ...(detail.trim() ? { detail: detail.trim() } : {}),
    });
    setPersonName("");
    setDetail("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${home?.name} vs ${away?.name}`}
        description={`${competitionById(match.competitionId)?.name} · ${match.round} · ${venueById(match.venueId)?.name}`}
        meta={
          <>
            <StatusBadge status={match.status} />
            <StatusBadge status={match.published ? "PUBLISHED" : "DRAFT"} />
            <span className="font-mono text-xs text-muted-foreground">{match.id}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/matches">Kembali</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={locked || !match.events.length || !officialsComplete}
              onClick={() => validateMatchReport(match.id)}
            >
              {locked ? "Laporan tervalidasi" : "Validasi laporan"}
            </Button>
            <Button size="sm" disabled={!locked || match.published} onClick={() => publishMatch(match.id)}>
              {match.published ? "Sudah dipublikasikan" : "Publikasikan hasil"}
            </Button>
          </>
        }
      />

      {!locked ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Validasi laporan membutuhkan minimal satu event tercatat dan seluruh official terisi.
          Publikasi hanya tersedia setelah laporan tervalidasi.
        </p>
      ) : null}

      <LifecycleTrack current={match.status} />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-medium">{home?.name}</p>
              <p className="text-xs text-muted-foreground">Tuan rumah</p>
            </div>
            <p className="text-3xl font-semibold tabular-nums">
              {match.homeScore ?? "–"} : {match.awayScore ?? "–"}
            </p>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-medium">{away?.name}</p>
              <p className="text-xs text-muted-foreground">Tamu</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5 border-t border-border pt-4 sm:grid-cols-4">
            <Field label="Kickoff" value={formatDateTime(match.kickoff)} />
            <Field label="Akumulasi foul" value={`${match.teamFouls.home} – ${match.teamFouls.away}`} />
            <Field label="Timeout" value={`${match.timeouts.home} – ${match.timeouts.away}`} />
            <Field
              label="Regulasi"
              value={competitionById(match.competitionId)?.regulationCode ?? "—"}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Match officials" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {match.officials.map((o) => (
              <li key={o.role} className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{refereeName(o.refereeId) || "Belum ditugaskan"}</p>
                    <p className="text-xs text-muted-foreground">{o.role.replace(/_/g, " ")}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                {locked ? null : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      value={o.refereeId ?? ""}
                      aria-label={`Wasit untuk ${o.role}`}
                      onChange={(e) =>
                        e.target.value
                          ? assignOfficial(match.id, o.role, e.target.value)
                          : clearOfficial(match.id, o.role)
                      }
                      className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">— Belum ditugaskan —</option>
                      {referees.map((r) => (
                        <option key={r.id} value={r.id}>
                          {refereeName(r.id)} · {r.grade}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      disabled={o.status !== "ASSIGNED" && o.status !== "CONFIRMED"}
                      onClick={() => advanceOfficial(match.id, o.role)}
                    >
                      {o.status === "ASSIGNED" ? "Konfirmasi" : "Kehadiran"}
                    </Button>
                  </div>
                )}
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

        <TabsContent value="events" className="mt-4 space-y-4">
          {locked ? null : (
            <SectionCard title="Catat event" description="Skor, foul, dan timeout dihitung otomatis dari event log.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <Label htmlFor="minute">Menit</Label>
                  <Input
                    id="minute"
                    type="number"
                    min={1}
                    className="mt-1.5 h-9"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="half">Babak</Label>
                  <select
                    id="half"
                    value={half}
                    onChange={(e) => setHalf(e.target.value === "2" ? "2" : "1")}
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="1">Babak 1</option>
                    <option value="2">Babak 2</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="type">Event</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as MatchEventType)}
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="team">Tim</Label>
                  <select
                    id="team"
                    value={team}
                    onChange={(e) => setTeam(e.target.value === "AWAY" ? "AWAY" : "HOME")}
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="HOME">{home?.name ?? "Home"}</option>
                    <option value="AWAY">{away?.name ?? "Away"}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="personName">Person</Label>
                  <Input
                    id="personName"
                    className="mt-1.5 h-9"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Nama pemain/official"
                  />
                </div>
                <div>
                  <Label htmlFor="detail">Detail</Label>
                  <Input
                    id="detail"
                    className="mt-1.5 h-9"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Opsional"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={submitEvent} disabled={!personName.trim()}>
                  Tambah event
                </Button>
              </div>
            </SectionCard>
          )}

          {match.events.length ? (
            <div className="overflow-x-auto rounded-md border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    {["Menit", "Babak", "Event", "Tim", "Person", "Detail", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {match.events.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-2.5 tabular-nums">{e.minute}&apos;</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">Babak {e.half}</td>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                        {e.type.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2.5">{e.team === "HOME" ? home?.name : away?.name}</td>
                      <td className="px-4 py-2.5">{e.personName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.detail ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={locked}
                          onClick={() => removeMatchEvent(match.id, e.id)}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada event tercatat"
              description="Gunakan formulir di atas untuk mencatat event pertandingan."
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
                        <span className="w-7 text-center font-mono text-xs text-muted-foreground">
                          {p.number}
                        </span>
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
