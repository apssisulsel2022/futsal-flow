import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DataTable, PageHeader, SectionCard, StatusBadge, type Column } from "@/components/kit";
import { formatDate, people } from "@/data/mock";
import { useAppState } from "@/context/app-state";
import type { Person } from "@/data/domain";

export const Route = createFileRoute("/app/people/")({
  head: () => ({
    meta: [
      { title: "Registri Orang — Futsal Ecosystem" },
      { name: "description", content: "Satu identitas untuk pemain, pelatih, wasit, dan pengurus dalam registri terpadu." },
      { property: "og:title", content: "Registri Orang — Futsal Ecosystem" },
      { property: "og:description", content: "Satu identitas untuk pemain, pelatih, wasit, dan pengurus dalam registri terpadu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PeoplePage,
});

const columns: Column<Person>[] = [
  {
    key: "name",
    header: "Person",
    render: (p) => (
      <div className="min-w-0">
        <Link to="/app/people/$personId" params={{ personId: p.id }} className="font-medium hover:underline">
          {p.fullName}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
      </div>
    ),
  },
  {
    key: "profiles",
    header: "Profil",
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.profiles.map((pr) => (
          <span key={pr} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
            {pr}
          </span>
        ))}
      </div>
    ),
  },
  { key: "birth", header: "Tgl lahir", render: (p) => formatDate(p.birthDate) },
  { key: "city", header: "Kota", render: (p) => p.city },
  { key: "contact", header: "Kontak", render: (p) => <span className="text-xs text-muted-foreground">{p.email}</span> },
  {
    key: "identity",
    header: "Identitas",
    render: (p) => <StatusBadge status={p.identityVerified ? "VERIFIED" : "PENDING"} />,
  },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
];

function PeoplePage() {
  const { organizationId } = useAppState();
  const rows = people.filter((p) => p.organizationId === organizationId);
  const pendingDocs = rows.flatMap((p) => p.documents).filter((d) => d.status === "PENDING").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="People"
        description="Identitas kanonik. Satu Person dapat memiliki beberapa profil (Player, Coach, Referee, Official) tanpa duplikasi identitas."
        meta={<span className="font-mono text-xs text-muted-foreground">tenant: {organizationId}</span>}
        actions={<Button size="sm">Tambah person</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SectionCard>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Total person</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{rows.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Identitas terverifikasi</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {rows.filter((p) => p.identityVerified).length}
          </p>
        </SectionCard>
        <SectionCard>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Dokumen menunggu</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-warning-foreground">{pendingDocs}</p>
        </SectionCard>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={(p) => `${p.fullName} ${p.nickname} ${p.city} ${p.email} ${p.profiles.join(" ")}`}
        searchPlaceholder="Cari nama, kota, profil…"
        emptyTitle="Tidak ada person pada tenant ini"
      />
    </div>
  );
}
