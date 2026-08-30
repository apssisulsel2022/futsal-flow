import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, MockNotice, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { permissionMatrix, policies } from "@/data/mock";
import { roleLabels } from "@/context/app-state";
import type { RoleKey } from "@/data/domain";

export const Route = createFileRoute("/app/governance")({
  head: () => ({
    meta: [
      { title: "Tata Kelola & Matriks Izin — Futsal Ecosystem" },
      { name: "description", content: "Matriks peran dan izin sistem, kebijakan tata kelola, serta kontrol kepatuhan platform futsal." },
      { property: "og:title", content: "Tata Kelola & Matriks Izin — Futsal Ecosystem" },
      { property: "og:description", content: "Matriks peran dan izin sistem, kebijakan tata kelola, serta kontrol kepatuhan platform futsal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GovernancePage,
});

function GovernancePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Governance"
        description="System rule bersifat tetap dan tidak dapat dinegosiasikan; organization policy dan regulasi kompetisi bersifat konfigurabel dan berversi."
      />
      <MockNotice />

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">System rules</TabsTrigger>
          <TabsTrigger value="policies">Policy & regulasi</TabsTrigger>
          <TabsTrigger value="permissions">Permission matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4 space-y-4">
          <DataTable
            rows={policies.filter((p) => p.kind === "SYSTEM_RULE")}
            rowKey={(p) => p.code}
            columns={[
              { key: "code", header: "Kode", render: (p) => <span className="font-mono text-xs">{p.code}</span> },
              { key: "name", header: "Rule", render: (p) => <span className="font-medium">{p.name}</span> },
              { key: "summary", header: "Ringkasan", render: (p) => <span className="text-muted-foreground">{p.summary}</span> },
              { key: "version", header: "Versi", render: (p) => p.version },
              { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
            ]}
          />
          <SectionCard title="Sifat system rule">
            <p className="text-sm text-muted-foreground">
              System rule tidak dapat dimatikan oleh organisasi mana pun. Contohnya tenant isolation dan kewajiban
              audit pada aksi kritikal.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="policies" className="mt-4">
          <DataTable
            rows={policies.filter((p) => p.kind !== "SYSTEM_RULE")}
            rowKey={(p) => p.code}
            columns={[
              { key: "code", header: "Kode", render: (p) => <span className="font-mono text-xs">{p.code}</span> },
              { key: "name", header: "Nama", render: (p) => <span className="font-medium">{p.name}</span> },
              { key: "kind", header: "Jenis", render: (p) => p.kind.replace(/_/g, " ").toLowerCase() },
              { key: "owner", header: "Owner", render: (p) => p.owner },
              { key: "version", header: "Versi", render: (p) => p.version },
              { key: "summary", header: "Ringkasan", render: (p) => <span className="text-muted-foreground">{p.summary}</span> },
              { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <DataTable
            rows={permissionMatrix}
            rowKey={(p) => p.permission}
            pageSize={15}
            searchKeys={(p) => `${p.permission} ${p.resource} ${p.scope} ${p.roles.join(" ")}`}
            searchPlaceholder="Cari permission, resource, role…"
            columns={[
              { key: "permission", header: "Permission", render: (p) => <span className="font-mono text-xs">{p.permission}</span> },
              { key: "resource", header: "Resource", render: (p) => p.resource },
              { key: "scope", header: "Scope", render: (p) => p.scope },
              {
                key: "roles",
                header: "Role",
                render: (p) => (
                  <div className="flex flex-wrap gap-1">
                    {p.roles.map((r) => (
                      <span key={r} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                        {roleLabels[r as RoleKey] ?? r}
                      </span>
                    ))}
                  </div>
                ),
              },
              { key: "policy", header: "Policy sumber", render: (p) => <span className="font-mono text-xs">{p.policy}</span> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
