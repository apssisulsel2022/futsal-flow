import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable, Field, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { permissionMatrix, personById, sessions } from "@/data/mock";
import { roleActor, roleLabels, useAppState } from "@/context/app-state";
import type { RoleKey } from "@/data/domain";

export const Route = createFileRoute("/app/identity")({
  component: IdentityPage,
});

function IdentityPage() {
  const { role, organizationId } = useAppState();
  const actor = roleActor[role];
  const person = personById(actor.personId);
  const myPermissions = permissionMatrix.filter((p) => p.roles.includes(role));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Identity & Access"
        description="Satu akun, banyak peran. Otorisasi ditentukan oleh kombinasi role, scope organisasi, dan policy."
        meta={<span className="font-mono text-xs text-muted-foreground">{actor.personId}</span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Akun aktif" className="lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-3">
            <Field label="Nama" value={person?.fullName ?? actor.name} />
            <Field label="Email" value={person?.email ?? "—"} />
            <Field label="Telepon" value={person?.phone ?? "—"} />
            <Field label="Peran aktif" value={roleLabels[role]} />
            <Field label="Scope organisasi" value={<span className="font-mono text-xs">{organizationId}</span>} />
            <Field
              label="Verifikasi identitas"
              value={<StatusBadge status={person?.identityVerified ? "VERIFIED" : "PENDING"} />}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Keamanan">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Kode OTP saat masuk dari device baru.</p>
              </div>
              <Switch defaultChecked aria-label="Two-factor authentication" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Notifikasi login</p>
                <p className="text-xs text-muted-foreground">Email saat ada sesi baru.</p>
              </div>
              <Switch defaultChecked aria-label="Notifikasi login" />
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Ubah kata sandi
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Peran yang tersedia" description="Peran dapat ditukar dari header tanpa membuat akun baru." bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {(Object.keys(roleLabels) as RoleKey[]).map((r) => (
            <li key={r} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{roleLabels[r]}</p>
                <p className="text-xs text-muted-foreground">
                  {permissionMatrix.filter((p) => p.roles.includes(r)).length} permission
                </p>
              </div>
              {r === role ? <StatusBadge status="ACTIVE" /> : <span className="text-xs text-muted-foreground">Tidak aktif</span>}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Permission peran aktif" bodyClassName="p-0">
        <DataTable
          rows={myPermissions}
          rowKey={(p) => p.permission}
          pageSize={15}
          columns={[
            { key: "permission", header: "Permission", render: (p) => <span className="font-mono text-xs">{p.permission}</span> },
            { key: "resource", header: "Resource", render: (p) => p.resource },
            { key: "scope", header: "Scope", render: (p) => p.scope },
            { key: "policy", header: "Policy", render: (p) => <span className="font-mono text-xs">{p.policy}</span> },
          ]}
        />
      </SectionCard>

      <SectionCard title="Sesi aktif" bodyClassName="p-0">
        <DataTable
          rows={sessions}
          columns={[
            { key: "device", header: "Device", render: (s) => <span className="font-medium">{s.device}</span> },
            { key: "location", header: "Lokasi", render: (s) => s.location },
            { key: "ip", header: "IP", render: (s) => <span className="font-mono text-xs">{s.ip}</span> },
            { key: "last", header: "Aktivitas terakhir", render: (s) => s.lastActive },
            {
              key: "state",
              header: "Status",
              render: (s) =>
                s.current ? (
                  <StatusBadge status="ACTIVE" />
                ) : (
                  <Button variant="outline" size="sm">
                    Akhiri sesi
                  </Button>
                ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}
