import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  EmptyState,
  Field,
  LifecycleTrack,
  PageHeader,
  SectionCard,
  StatusBadge,
  Timeline,
} from "@/components/kit";
import { formatDate, orgById, venueById } from "@/data/mock";
import { useMockStore } from "@/context/mock-store";

export const Route = createFileRoute("/app/licensing/$permitId")({
  head: () => ({
    meta: [
      { title: "Review Pengajuan Izin — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Detail pengajuan izin: checklist requirement, riwayat proses, dan keputusan reviewer dengan alasan wajib.",
      },
      { property: "og:title", content: "Review Pengajuan Izin — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "Verifikasi requirement dan putuskan pengajuan izin event futsal.",
      },
    ],
  }),
  errorComponent: () => <EmptyState title="Pengajuan gagal dimuat" />,
  notFoundComponent: () => <EmptyState title="Pengajuan izin tidak ditemukan" />,
  component: PermitDetail,
});

function PermitDetail() {
  const { permitId } = Route.useParams();
  const { permitById, decidePermit } = useMockStore();
  const permit = permitById(permitId);
  const [reason, setReason] = useState("");

  if (!permit) {
    return (
      <EmptyState
        title="Pengajuan izin tidak ditemukan"
        description="Pengajuan mungkin sudah dihapus atau tautan tidak valid."
      />
    );
  }

  const fulfilled = permit.requirements.filter((r) => r.fulfilled).length;
  const complete = fulfilled === permit.requirements.length;
  const decided = permit.status === "APPROVED" || permit.status === "REJECTED";

  const decide = (decision: "APPROVE" | "REJECT" | "REQUEST_INFO") => {
    decidePermit(permit.id, decision, reason.trim());
    setReason("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={permit.eventName}
        description={`${permit.permitType} · ${orgById(permit.organizationId)?.shortName ?? permit.organizationId}`}
        meta={
          <>
            <StatusBadge status={permit.status} />
            <span className="font-mono text-xs text-muted-foreground">
              {permit.permitNo ?? permit.id}
            </span>
          </>
        }
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/licensing">Kembali</Link>
          </Button>
        }
      />

      <LifecycleTrack current={permit.status} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Detail pengajuan">
            <dl className="grid gap-5 sm:grid-cols-3">
              <Field label="Venue" value={venueById(permit.venueId)?.name ?? "—"} />
              <Field label="Mulai" value={formatDate(permit.startDate)} />
              <Field label="Selesai" value={formatDate(permit.endDate)} />
              <Field label="Diajukan oleh" value={permit.submittedBy} />
              <Field label="Tanggal pengajuan" value={permit.submittedAt} />
              <Field label="Reviewer" value={permit.reviewer ?? "Belum ditetapkan"} />
              <Field label="Alasan keputusan" value={permit.decisionReason ?? "—"} />
            </dl>
          </SectionCard>

          <SectionCard
            title="Requirement checklist"
            description={`${fulfilled} dari ${permit.requirements.length} requirement terpenuhi.`}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {permit.requirements.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className={
                      r.fulfilled
                        ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success"
                        : "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive"
                    }
                    aria-hidden
                  >
                    {r.fulfilled ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.category}
                      {r.note ? ` · ${r.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Keputusan"
            description="Approve atau reject wajib menyertakan alasan dan akan tercatat pada audit trail."
          >
            <div className="space-y-3">
              <div>
                <Label htmlFor="decision-reason">Alasan keputusan</Label>
                <Textarea
                  id="decision-reason"
                  className="mt-1.5"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={decided}
                  placeholder="Contoh: seluruh requirement terpenuhi dan venue tersertifikasi."
                />
              </div>
              {decided ? (
                <p className="text-xs text-muted-foreground">
                  Keputusan sudah final — pengajuan terkunci untuk perubahan.
                </p>
              ) : (
                <>
                  {!complete ? (
                    <p className="text-xs text-warning-foreground">
                      Requirement belum lengkap — approve diblokir oleh policy POL-ORG-004.
                    </p>
                  ) : null}
                  {!reason.trim() ? (
                    <p className="text-xs text-muted-foreground">
                      Alasan wajib diisi sebelum keputusan dapat disimpan.
                    </p>
                  ) : null}
                </>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!complete || decided || !reason.trim()}
                  onClick={() => decide("APPROVE")}
                >
                  Setujui &amp; terbitkan izin
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={decided || !reason.trim()}
                  onClick={() => decide("REQUEST_INFO")}
                >
                  Minta informasi tambahan
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={decided || !reason.trim()}
                  onClick={() => decide("REJECT")}
                >
                  Tolak
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Riwayat proses">
          <Timeline items={permit.timeline} />
        </SectionCard>
      </div>
    </div>
  );
}
