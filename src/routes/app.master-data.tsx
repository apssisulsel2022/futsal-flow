import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, MockNotice, PageHeader, StatusBadge } from "@/components/kit";
import { masterData, venues } from "@/data/mock";

export const Route = createFileRoute("/app/master-data")({
  head: () => ({
    meta: [
      { title: "Master Data Referensi — Futsal Ecosystem" },
      { name: "description", content: "Referensi kategori kompetisi, standar venue, dan tingkatan lisensi wasit." },
      { property: "og:title", content: "Master Data Referensi — Futsal Ecosystem" },
      { property: "og:description", content: "Referensi kategori kompetisi, standar venue, dan tingkatan lisensi wasit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MasterDataPage,
});

function MasterDataPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Master Data"
        description="Referensi lintas domain: kategori kompetisi, tipe izin, grade wasit, venue, dan court. Requirement dan aturan bersifat konfigurabel per organisasi."
      />
      <MockNotice />

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Kategori kompetisi</TabsTrigger>
          <TabsTrigger value="permits">Tipe izin</TabsTrigger>
          <TabsTrigger value="grades">Grade wasit</TabsTrigger>
          <TabsTrigger value="venues">Venue & court</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <DataTable
            rows={masterData.competitionCategories}
            rowKey={(c) => c.code}
            columns={[
              { key: "code", header: "Kode", render: (c) => <span className="font-mono text-xs">{c.code}</span> },
              { key: "name", header: "Nama", render: (c) => <span className="font-medium">{c.name}</span> },
              { key: "age", header: "Aturan usia", render: (c) => c.ageRule },
            ]}
          />
        </TabsContent>

        <TabsContent value="permits" className="mt-4">
          <DataTable
            rows={masterData.permitTypes}
            rowKey={(p) => p.code}
            columns={[
              { key: "code", header: "Kode", render: (p) => <span className="font-mono text-xs">{p.code}</span> },
              { key: "name", header: "Tipe izin", render: (p) => <span className="font-medium">{p.name}</span> },
              { key: "req", header: "Jumlah requirement", render: (p) => <span className="tabular-nums">{p.requirements}</span> },
              { key: "sla", header: "SLA keputusan", render: (p) => p.sla },
            ]}
          />
        </TabsContent>

        <TabsContent value="grades" className="mt-4">
          <DataTable
            rows={masterData.refereeGrades}
            rowKey={(g) => g.code}
            columns={[
              { key: "code", header: "Kode", render: (g) => <span className="font-mono text-xs">{g.code}</span> },
              { key: "name", header: "Grade", render: (g) => <span className="font-medium">{g.name}</span> },
              { key: "level", header: "Level maksimum", render: (g) => g.maxLevel },
            ]}
          />
        </TabsContent>

        <TabsContent value="venues" className="mt-4">
          <DataTable
            rows={venues}
            searchKeys={(v) => `${v.name} ${v.city} ${v.surface}`}
            searchPlaceholder="Cari venue…"
            columns={[
              { key: "name", header: "Venue", render: (v) => <span className="font-medium">{v.name}</span> },
              { key: "city", header: "Kota", render: (v) => v.city },
              { key: "courts", header: "Court", render: (v) => <span className="tabular-nums">{v.courts}</span> },
              { key: "surface", header: "Permukaan", render: (v) => v.surface },
              { key: "std", header: "Standar teknis", render: (v) => v.technicalStandard },
              {
                key: "safety",
                header: "Sertifikasi keselamatan",
                render: (v) => <StatusBadge status={v.safetyCertified ? "VERIFIED" : "PENDING"} />,
              },
              { key: "owner", header: "Tenant", render: (v) => <span className="font-mono text-xs">{v.organizationId}</span> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
