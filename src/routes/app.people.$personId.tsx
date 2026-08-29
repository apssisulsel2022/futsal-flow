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
import { formatDate, orgById, personById, referees } from "@/data/mock";

export const Route = createFileRoute("/app/people/$personId")({
  loader: ({ params }) => {
    const person = personById(params.personId);
    if (!person) throw notFound();
    return { person };
  },
  errorComponent: () => <EmptyState title="Person gagal dimuat" />,
  notFoundComponent: () => <EmptyState title="Person tidak ditemukan" />,
  component: PersonDetail,
});

function PersonDetail() {
  const { person } = Route.useLoaderData();
  const refereeProfile = referees.find((r) => r.personId === person.id);

  return (
    <div>
      <PageHeader
        title={person.fullName}
        description={`${person.city} · ${orgById(person.organizationId)?.shortName ?? person.organizationId}`}
        meta={
          <>
            <StatusBadge status={person.status} />
            <StatusBadge status={person.identityVerified ? "VERIFIED" : "PENDING"} />
            <span className="font-mono text-xs text-muted-foreground">{person.id}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/people">Kembali</Link>
            </Button>
            <Button size="sm">Verifikasi identitas</Button>
          </>
        }
      />

      <div className="mb-4">
        <LifecycleTrack current={person.status} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
          <TabsTrigger value="qualifications">Kualifikasi</TabsTrigger>
          {refereeProfile ? <TabsTrigger value="referee">Referee</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <SectionCard title="Identitas kanonik">
            <dl className="grid gap-5 sm:grid-cols-3">
              <Field label="Nama lengkap" value={person.fullName} />
              <Field label="Nama panggilan" value={person.nickname} />
              <Field label="Tanggal lahir" value={formatDate(person.birthDate)} />
              <Field label="Jenis kelamin" value={person.gender === "M" ? "Laki-laki" : "Perempuan"} />
              <Field label="Kota" value={person.city} />
              <Field label="Telepon" value={person.phone} />
              <Field label="Email" value={person.email} />
              <Field label="Tenant" value={<span className="font-mono text-xs">{person.organizationId}</span>} />
              <Field
                label="Profil aktif"
                value={
                  <div className="flex flex-wrap gap-1">
                    {person.profiles.map((p) => (
                      <span key={p} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                }
              />
            </dl>
          </SectionCard>
          <SectionCard title="Prinsip One Identity">
            <p className="text-sm text-muted-foreground">
              Semua profil di atas menunjuk ke satu Person ID <span className="font-mono">{person.id}</span>. Tidak
              ada tabel terpisah yang membuat identitas orang sendiri untuk player, coach, atau referee.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          {person.documents.length ? (
            <DataTable
              rows={person.documents}
              columns={[
                { key: "name", header: "Dokumen", render: (d) => <span className="font-medium">{d.name}</span> },
                { key: "type", header: "Tipe", render: (d) => <span className="font-mono text-xs">{d.type}</span> },
                { key: "uploaded", header: "Diunggah", render: (d) => formatDate(d.uploadedAt) },
                { key: "verifier", header: "Diverifikasi oleh", render: (d) => d.verifiedBy ?? "—" },
                { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
              ]}
            />
          ) : (
            <EmptyState title="Belum ada dokumen" />
          )}
        </TabsContent>

        <TabsContent value="qualifications" className="mt-4">
          {person.qualifications.length ? (
            <DataTable
              rows={person.qualifications}
              rowKey={(q) => q.name}
              columns={[
                { key: "name", header: "Kualifikasi", render: (q) => <span className="font-medium">{q.name}</span> },
                { key: "issuer", header: "Penerbit", render: (q) => q.issuer },
                { key: "issued", header: "Terbit", render: (q) => formatDate(q.issuedAt) },
                { key: "expires", header: "Berlaku sampai", render: (q) => formatDate(q.expiresAt) },
              ]}
            />
          ) : (
            <EmptyState title="Belum ada kualifikasi tercatat" />
          )}
        </TabsContent>

        {refereeProfile ? (
          <TabsContent value="referee" className="mt-4 space-y-4">
            <SectionCard title="Referee profile" description="Lisensi, grade, dan ketersediaan.">
              <dl className="grid gap-5 sm:grid-cols-3">
                <Field label="Referee ID" value={<span className="font-mono text-xs">{refereeProfile.id}</span>} />
                <Field label="Nomor lisensi" value={refereeProfile.licenseNo} />
                <Field label="Grade" value={refereeProfile.grade} />
                <Field label="Status lisensi" value={<StatusBadge status={refereeProfile.licenseStatus} />} />
                <Field label="Berlaku sampai" value={formatDate(refereeProfile.licenseExpiresAt)} />
                <Field label="Ketersediaan" value={refereeProfile.availability.join(", ")} />
                <Field label="Penugasan bulan ini" value={refereeProfile.assignmentsThisMonth} />
                <Field label="Skor performa" value={`${refereeProfile.performanceScore}/100`} />
                <Field
                  label="Conflict of interest"
                  value={refereeProfile.conflictOrganizationIds.join(", ") || "Tidak ada"}
                />
              </dl>
            </SectionCard>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/assignments">Lihat papan penugasan</Link>
            </Button>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
