import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
  type Column,
} from "@/components/kit";
import {
  formatDate,
  formatIDR,
  honoraria,
  honorariumRates,
  matchById,
  refereeName,
  teamById,
} from "@/data/mock";
import type { Honorarium } from "@/data/domain";

export const Route = createFileRoute("/app/honorarium")({
  component: HonorariumPage,
});

const columns: Column<Honorarium>[] = [
  { key: "invoice", header: "Invoice", render: (h) => <span className="font-mono text-xs">{h.invoiceNo}</span> },
  {
    key: "referee",
    header: "Wasit",
    render: (h) => (
      <div className="min-w-0">
        <p className="font-medium">{refereeName(h.refereeId)}</p>
        <p className="text-xs text-muted-foreground">{h.role}</p>
      </div>
    ),
  },
  {
    key: "match",
    header: "Pertandingan",
    render: (h) => {
      const m = matchById(h.matchId);
      if (!m) return "—";
      return (
        <Link to="/app/matches/$matchId" params={{ matchId: m.id }} className="hover:underline">
          {teamById(m.homeTeamId)?.name} vs {teamById(m.awayTeamId)?.name}
        </Link>
      );
    },
  },
  { key: "period", header: "Periode", render: (h) => h.period },
  { key: "amount", header: "Nominal", render: (h) => <span className="tabular-nums">{formatIDR(h.amount)}</span> },
  { key: "approver", header: "Disetujui oleh", render: (h) => h.approvedBy ?? "—" },
  { key: "paid", header: "Dibayar", render: (h) => (h.paidAt ? formatDate(h.paidAt) : "—") },
  { key: "status", header: "Status", render: (h) => <StatusBadge status={h.status} /> },
];

function HonorariumPage() {
  const total = honoraria.reduce((s, h) => s + h.amount, 0);
  const paid = honoraria.filter((h) => h.status === "COMPLETED").reduce((s, h) => s + h.amount, 0);
  const pending = honoraria.filter((h) => h.status !== "COMPLETED").reduce((s, h) => s + h.amount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Honorarium"
        description="Tarif → perhitungan → invoice → approval → pembayaran → rekonsiliasi. Kelayakan honorarium bergantung pada kehadiran dan laporan pertandingan yang tervalidasi."
        actions={<Button size="sm">Buat batch pembayaran</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total tercatat" value={formatIDR(total)} />
        <MetricCard label="Sudah dibayar" value={formatIDR(paid)} tone="success" />
        <MetricCard label="Belum dibayar" value={formatIDR(pending)} tone="warning" />
        <MetricCard label="Menunggu approval" value={honoraria.filter((h) => h.status === "SUBMITTED" || h.status === "UNDER_REVIEW").length} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoice</TabsTrigger>
          <TabsTrigger value="rates">Tarif</TabsTrigger>
          <TabsTrigger value="recon">Rekonsiliasi</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <DataTable
            columns={columns}
            rows={honoraria}
            searchKeys={(h) => `${h.invoiceNo} ${refereeName(h.refereeId)} ${h.role} ${h.period} ${h.status}`}
            searchPlaceholder="Cari invoice, wasit, periode…"
          />
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <DataTable
            rows={honorariumRates}
            rowKey={(r) => `${r.grade}-${r.role}`}
            columns={[
              { key: "grade", header: "Grade", render: (r) => <span className="font-mono text-xs">{r.grade}</span> },
              { key: "role", header: "Peran", render: (r) => <span className="font-medium">{r.role}</span> },
              { key: "amount", header: "Tarif per pertandingan", render: (r) => <span className="tabular-nums">{formatIDR(r.amount)}</span> },
            ]}
          />
        </TabsContent>

        <TabsContent value="recon" className="mt-4">
          <SectionCard title="Ringkasan periode Agustus 2026">
            <dl className="grid gap-5 sm:grid-cols-4">
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">Jumlah invoice</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{honoraria.length}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">Nilai disetujui</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatIDR(honoraria.filter((h) => h.approvedBy).reduce((s, h) => s + h.amount, 0))}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">Selisih belum dibayar</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-warning-foreground">{formatIDR(pending)}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">Status rekonsiliasi</dt>
                <dd className="mt-1">
                  <StatusBadge status="UNDER_REVIEW" />
                </dd>
              </div>
            </dl>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
