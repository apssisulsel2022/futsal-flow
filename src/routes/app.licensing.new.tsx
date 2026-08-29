import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, PageHeader, SectionCard } from "@/components/kit";
import { venues } from "@/data/mock";
import { useMockStore } from "@/context/mock-store";
import type { RequirementItem } from "@/data/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/licensing/new")({
  head: () => ({
    meta: [
      { title: "Ajukan Izin Event — Futsal Ecosystem" },
      {
        name: "description",
        content:
          "Wizard pengajuan izin event futsal: data event, venue & jadwal, dokumen persyaratan, serta official & safety.",
      },
      { property: "og:title", content: "Ajukan Izin Event — Futsal Ecosystem" },
      {
        property: "og:description",
        content: "Empat langkah pengajuan izin event futsal dengan validasi requirement.",
      },
    ],
  }),
  component: NewPermitWizard,
});

const steps = ["Data event", "Venue & jadwal", "Dokumen persyaratan", "Official & safety"];

const documentRequirements: { id: string; label: string; category: RequirementItem["category"] }[] =
  [
    { id: "REQ-DOC-1", label: "Surat permohonan resmi", category: "DOCUMENT" },
    { id: "REQ-DOC-2", label: "Regulasi kompetisi", category: "DOCUMENT" },
    { id: "REQ-DOC-3", label: "Daftar tim peserta", category: "DOCUMENT" },
  ];

const safetyRequirements: { id: string; label: string; category: RequirementItem["category"] }[] = [
  { id: "REQ-OFF-1", label: "Penunjukan match commissioner", category: "OFFICIAL" },
  { id: "REQ-SAF-1", label: "Tenaga medis & ambulans siaga", category: "SAFETY" },
  { id: "REQ-SAF-2", label: "Rencana keamanan & evakuasi", category: "SAFETY" },
];

function NewPermitWizard() {
  const navigate = useNavigate();
  const { createPermit } = useMockStore();
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const [eventName, setEventName] = useState("");
  const [permitType, setPermitType] = useState("Izin Kompetisi");
  const [notes, setNotes] = useState("");
  const [venueId, setVenueId] = useState(venues[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!eventName.trim()) errors.eventName = "Nama event wajib diisi.";
    if (!permitType.trim()) errors.permitType = "Tipe izin wajib diisi.";
  }
  if (step === 1) {
    if (!venueId) errors.venueId = "Venue wajib dipilih.";
    if (!startDate) errors.startDate = "Tanggal mulai wajib diisi.";
    if (!endDate) errors.endDate = "Tanggal selesai wajib diisi.";
    if (startDate && endDate && endDate < startDate)
      errors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }
  const invalid = Object.keys(errors).length > 0;

  const allRequirements: RequirementItem[] = [...documentRequirements, ...safetyRequirements].map(
    (r) => ({
      id: r.id,
      label: r.label,
      category: r.category,
      fulfilled: Boolean(checked[r.id]),
      note: checked[r.id] ? "Dinyatakan lengkap oleh pemohon" : "Belum dilampirkan",
    }),
  );

  const next = () => {
    if (invalid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const submit = () => {
    const id = createPermit({
      eventName: eventName.trim(),
      permitType,
      venueId,
      startDate,
      endDate,
      requirements: allRequirements,
    });
    navigate({ to: "/app/licensing/$permitId", params: { permitId: id } });
  };

  const err = (key: string) =>
    showErrors && errors[key] ? (
      <p className="mt-1 text-xs text-destructive">{errors[key]}</p>
    ) : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ajukan izin event"
        description="Lengkapi empat langkah berikut. Pengajuan akan masuk antrean review dengan status SUBMITTED."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/licensing">Batal</Link>
          </Button>
        }
      />

      <ol className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              "rounded border px-2 py-1 text-[11px] font-medium",
              i === step
                ? "border-primary bg-primary/10 text-primary"
                : i < step
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground",
            )}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={steps[step]} className="lg:col-span-2">
          {step === 0 ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName">Nama event</Label>
                <Input
                  id="eventName"
                  className="mt-1.5"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Contoh: Liga Futsal Sulsel 2026"
                />
                {err("eventName")}
              </div>
              <div>
                <Label htmlFor="permitType">Tipe izin</Label>
                <select
                  id="permitType"
                  value={permitType}
                  onChange={(e) => setPermitType(e.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option>Izin Kompetisi</option>
                  <option>Izin Turnamen</option>
                  <option>Izin Pertandingan Uji Coba</option>
                </select>
                {err("permitType")}
              </div>
              <div>
                <Label htmlFor="notes">Catatan pemohon</Label>
                <Textarea
                  id="notes"
                  className="mt-1.5"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Konteks tambahan untuk reviewer (opsional)."
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="venueId">Venue</Label>
                <select
                  id="venueId"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">— Pilih venue —</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.city}
                      {v.safetyCertified ? " · tersertifikasi" : ""}
                    </option>
                  ))}
                </select>
                {err("venueId")}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Tanggal mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="mt-1.5"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  {err("startDate")}
                </div>
                <div>
                  <Label htmlFor="endDate">Tanggal selesai</Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="mt-1.5"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {err("endDate")}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 || step === 3 ? (
            <ul className="space-y-3">
              {(step === 2 ? documentRequirements : safetyRequirements).map((r) => (
                <li key={r.id} className="flex items-start gap-3">
                  <Checkbox
                    id={r.id}
                    checked={Boolean(checked[r.id])}
                    onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [r.id]: v === true }))}
                    className="mt-0.5"
                  />
                  <Label htmlFor={r.id} className="font-normal">
                    <span className="block text-sm font-medium">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.category}</span>
                  </Label>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Sebelumnya
            </Button>
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={next}>
                Lanjut
              </Button>
            ) : (
              <Button size="sm" onClick={submit}>
                Ajukan izin
              </Button>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Ringkasan" description="Diperbarui otomatis sebelum submit.">
          <dl className="grid gap-4">
            <Field label="Nama event" value={eventName || "—"} />
            <Field label="Tipe izin" value={permitType} />
            <Field
              label="Venue"
              value={venues.find((v) => v.id === venueId)?.name ?? "Belum dipilih"}
            />
            <Field label="Periode" value={startDate && endDate ? `${startDate} – ${endDate}` : "—"} />
            <Field
              label="Requirement terpenuhi"
              value={`${allRequirements.filter((r) => r.fulfilled).length}/${allRequirements.length}`}
            />
            <Field label="Catatan" value={notes || "—"} />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Requirement yang belum dicentang tetap bisa diajukan, tetapi approve akan diblokir sampai
            lengkap.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
