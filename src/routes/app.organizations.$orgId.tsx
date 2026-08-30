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
import { auditEntries, formatDate, orgById, organizations, people, teams } from "@/data/mock";

export const Route = createFileRoute("/app/organizations/$orgId")({
  head: () => ({
    meta: [
      { title: "Detail Organisasi — Futsal Ecosystem" },
      { name: "description", content: "Profil organisasi, hierarki induk-anak, keanggotaan, kebijakan, dan jejak audit." },
      { property: "og:title", content: "Detail Organisasi — Futsal Ecosystem" },
      { property: "og:description", content: "Profil organisasi, hierarki induk-anak, keanggotaan, kebijakan, dan jejak audit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const org = orgById(params.orgId);
    if (!org) throw notFound();
    return { org };
  },
  errorComponent: () => <EmptyState title="Organisasi gagal dimuat" />,
  notFoundComponent: () => (
    <EmptyState title="Organisasi tidak ditemukan" description="ID tidak terdaftar pada tenant ini." />
  ),
  component: OrganizationDetail,
});

function OrganizationDetail() {
  const { org } = Route.useLoaderData();
  const children = organizations.filter((o) => o.parentId === org.id);
  const orgPeople = people.filter((p) => p.organizationId === org.id);
  const orgTeams = teams.filter((t) => t.organizationId === org.id);
  const orgAudit = auditEntries.filter((a) => a.organizationId === org.id);

  return (
    <div>
      <PageHeader
        title={org.name}
        description={`${org.type.replace(/_/g, " ")} · ${org.region}`}
        meta={
          <>
            <StatusBadge status={org.status} />
            <span className="font-mono text-xs text-muted-foreground">{org.id}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/organizations">Kembali</Link>
            </Button>
            <Button size="sm">Kelola organisasi</Button>
          </>
        }
      />

      <div className="mb-4">
        <LifecycleTrack current={org.status} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarki</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <SectionCard title="Data governance" description="Owner, source, status, dan verifikasi.">
            <dl className="grid gap-5 sm:grid-cols-3">
              <Field label="Nama singkat" value={org.shortName} />
              <Field label="Tipe" value={org.type.replace(/_/g, " ")} />
              <Field label="Wilayah" value={org.region} />
              <Field label="Dibuat" value={formatDate(org.createdAt)} />
              <Field label="Diverifikasi" value={formatDate(org.verifiedAt ?? "—")} />
              <Field label="Diverifikasi oleh" value={org.verifiedBy ?? "—"} />
              <Field label="Jumlah anggota" value={org.memberCount} />
              <Field label="Jumlah tim" value={org.teamCount} />
              <Field label="Tenant ownership" value={<span className="font-mono text-xs">organization_id = {org.id}</span>} />
            </dl>
          </SectionCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="People" description={`${orgPeople.length} person pada tenant ini.`} bodyClassName="p-0">
              {orgPeople.length ? (
                <ul className="divide-y divide-border">
                  {orgPeople.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-4 py-2.5">
                      <Link to="/app/people/$personId" params={{ personId: p.id }} className="text-sm hover:underline">
                        {p.fullName}
                      </Link>
                      <span className="text-xs text-muted-foreground">{p.profiles.join(" · ")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4">
                  <EmptyState title="Belum ada person" />
                </div>
              )}
            </SectionCard>

            <SectionCard title="Teams" description={`${orgTeams.length} tim terdaftar.`} bodyClassName="p-0">
              {orgTeams.length ? (
                <ul className="divide-y divide-border">
                  {orgTeams.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm">{t.name}</span>
                      <StatusBadge status={t.registrationStatus} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4">
                  <EmptyState title="Belum ada tim" />
                </div>
              )}
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <SectionCard title="Organization hierarchy">
            <div className="font-mono text-sm">
              <p>{org.parentId ? `${orgById(org.parentId)?.shortName} (parent)` : "ROOT"}</p>
              <p className="pl-4">└── {org.shortName}</p>
              {children.map((c, i) => (
                <p key={c.id} className="pl-12">
                  {i === children.length - 1 ? "└──" : "├──"} {c.shortName} · {c.type.toLowerCase()}
                </p>
              ))}
            </div>
            {!children.length ? (
              <p className="mt-3 text-xs text-muted-foreground">Tidak memiliki child organization.</p>
            ) : null}
          </SectionCard>
        </TabsContent>

        <TabsContent value="membership" className="mt-4">
          <DataTable
            rows={org.memberships}
            rowKey={(m) => m.personId}
            columns={[
              {
                key: "name",
                header: "Person",
                render: (m) => (
                  <Link to="/app/people/$personId" params={{ personId: m.personId }} className="font-medium hover:underline">
                    {m.name}
                  </Link>
                ),
              },
              { key: "role", header: "Organization role", render: (m) => m.role },
              { key: "since", header: "Sejak", render: (m) => formatDate(m.since) },
              { key: "id", header: "Person ID", render: (m) => <span className="font-mono text-xs">{m.personId}</span> },
            ]}
          />
        </TabsContent>

        <TabsContent value="policy" className="mt-4">
          {org.policies.length ? (
            <DataTable
              rows={org.policies}
              rowKey={(p) => p.code}
              columns={[
                { key: "code", header: "Kode", render: (p) => <span className="font-mono text-xs">{p.code}</span> },
                { key: "name", header: "Policy", render: (p) => <span className="font-medium">{p.name}</span> },
                { key: "scope", header: "Scope", render: (p) => p.scope },
                { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
              ]}
            />
          ) : (
            <EmptyState title="Belum ada organization policy" description="Policy diwarisi dari parent organization." />
          )}
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          {orgAudit.length ? (
            <DataTable
              rows={orgAudit}
              columns={[
                { key: "at", header: "Waktu", render: (a) => <span className="whitespace-nowrap">{a.at}</span> },
                { key: "actor", header: "Actor", render: (a) => `${a.actor} · ${a.actorRole}` },
                { key: "action", header: "Action", render: (a) => <span className="font-mono text-xs">{a.action}</span> },
                { key: "resource", header: "Resource", render: (a) => `${a.resource} ${a.resourceId}` },
                { key: "reason", header: "Reason", render: (a) => <span className="text-muted-foreground">{a.reason}</span> },
              ]}
            />
          ) : (
            <EmptyState title="Belum ada audit entry" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
