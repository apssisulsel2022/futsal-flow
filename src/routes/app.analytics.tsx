import { createFileRoute } from "@tanstack/react-router";
import { MetricCard, PageHeader, SectionCard, MockNotice } from "@/components/kit";
import {
  auditEntries,
  competitions,
  formatIDR,
  honoraria,
  matches,
  people,
  permits,
  referees,
} from "@/data/mock";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded bg-muted">
        <div
          className="h-2 rounded bg-primary"
          style={{ width: `${max ? Math.round((value / max) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const permitStatuses = ["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const;
  const permitCounts = permitStatuses.map((s) => ({
    label: s.replace(/_/g, " "),
    value: permits.filter((p) => p.status === s).length,
  }));
  const maxPermit = Math.max(...permitCounts.map((c) => c.value), 1);

  const refereeLoad = referees.map((r) => ({
    label: r.licenseNo,
    value: r.assignmentsThisMonth,
  }));
  const maxLoad = Math.max(...refereeLoad.map((r) => r.value), 1);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Ringkasan operasional lintas modul: perizinan, penugasan wasit, operasi pertandingan, dan finansial."
      />
      <MockNotice />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Person terdaftar" value={people.length} hint="Identitas kanonik" />
        <MetricCard label="Kompetisi aktif" value={competitions.filter((c) => c.status === "ACTIVE").length} tone="primary" />
        <MetricCard
          label="Laporan tervalidasi"
          value={`${matches.filter((m) => m.reportValidated).length}/${matches.length}`}
          tone="success"
        />
        <MetricCard label="Nilai honorarium" value={formatIDR(honoraria.reduce((s, h) => s + h.amount, 0))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Distribusi status perizinan" description="Funnel draft hingga keputusan.">
          <div className="space-y-3">
            {permitCounts.map((c) => (
              <Bar key={c.label} label={c.label} value={c.value} max={maxPermit} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Beban penugasan wasit" description="Batas policy: 8 penugasan per bulan.">
          <div className="space-y-3">
            {refereeLoad.map((r) => (
              <Bar key={r.label} label={r.label} value={r.value} max={Math.max(maxLoad, 8)} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Kepatuhan governance">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Entri audit tercatat</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{auditEntries.length}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Keputusan dengan alasan</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-success">
                {auditEntries.filter((a) => a.reason).length}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Izin melewati SLA</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-warning-foreground">1</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Dokumen menunggu verifikasi</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {people.flatMap((p) => p.documents).filter((d) => d.status === "PENDING").length}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Operasi pertandingan">
          <div className="space-y-3">
            <Bar label="Slot official terisi" value={matches.flatMap((m) => m.officials).filter((o) => o.refereeId).length} max={matches.flatMap((m) => m.officials).length} />
            <Bar label="Pertandingan dipublikasikan" value={matches.filter((m) => m.published).length} max={matches.length} />
            <Bar label="Honorarium dibayar" value={honoraria.filter((h) => h.status === "COMPLETED").length} max={honoraria.length} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
