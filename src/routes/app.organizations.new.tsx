import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockNotice, PageHeader, SectionCard, Timeline } from "@/components/kit";
import { organizations } from "@/data/mock";

export const Route = createFileRoute("/app/organizations/new")({
  component: NewOrganization,
});

function NewOrganization() {
  return (
    <div>
      <PageHeader
        title="Buat organisasi"
        description="Golden Slice Organization: create organization → create admin user → assign role → audit action."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/organizations">Kembali</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Profil organisasi">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Nama resmi</Label>
              <Input id="name" placeholder="Asosiasi Futsal Kota …" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="short">Nama singkat</Label>
              <Input id="short" placeholder="AFK …" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipe organisasi</Label>
              <Select defaultValue="CLUB">
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSOCIATION">Association</SelectItem>
                  <SelectItem value="CLUB">Club</SelectItem>
                  <SelectItem value="EVENT_ORGANIZER">Event Organizer</SelectItem>
                  <SelectItem value="SCHOOL">School</SelectItem>
                  <SelectItem value="COMMUNITY">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parent">Parent organization</Label>
              <Select defaultValue="ORG-001">
                <SelectTrigger id="parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region">Wilayah</Label>
              <Input id="region" placeholder="Kota / Kabupaten / Provinsi" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="admin">Email admin pertama</Label>
              <Input id="admin" placeholder="admin@organisasi.id" />
              <p className="text-xs text-muted-foreground">
                Admin pertama otomatis menerima role Organization Admin dengan scope organisasi ini.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reason">Alasan / dasar pembentukan</Label>
              <Textarea id="reason" rows={3} placeholder="Dicatat pada audit trail sebagai reason." />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">Simpan sebagai DRAFT</Button>
              <Button type="button" variant="secondary">
                Ajukan verifikasi
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Alur yang dijalankan">
            <Timeline
              items={[
                { at: "Langkah 1", actor: "Association Admin", action: "CREATE_ORGANIZATION" },
                { at: "Langkah 2", actor: "Sistem", action: "CREATE_ADMIN_USER", note: "Identitas & kredensial" },
                { at: "Langkah 3", actor: "Sistem", action: "ASSIGN_ROLE", note: "Scope = organisasi baru" },
                { at: "Langkah 4", actor: "Admin baru", action: "AUTHENTICATE" },
                { at: "Langkah 5", actor: "Sistem", action: "AUDIT_RECORDED", note: "WHO/WHAT/WHEN/WHY" },
              ]}
            />
          </SectionCard>
          <MockNotice>
            Form ini belum menulis ke database. Validasi bisnis, tenant ownership, dan audit akan
            dijalankan di sisi server.
          </MockNotice>
        </div>
      </div>
    </div>
  );
}
