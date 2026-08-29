import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Futsal Ecosystem Platform — Digital Operating Platform Futsal" },
      {
        name: "description",
        content:
          "Platform operasional digital untuk ekosistem futsal: identitas, organisasi, perizinan, kompetisi, wasit, keuangan, governance, dan data dalam satu sumber kebenaran.",
      },
      { property: "og:title", content: "Futsal Ecosystem Platform" },
      {
        property: "og:description",
        content:
          "One Identity — One Organization — One Competition — One Match Record — One Source of Truth.",
      },
    ],
  }),
  component: Landing,
});

const capabilities = [
  { code: "01", name: "Identity & Authentication", note: "Satu identitas untuk semua peran" },
  { code: "02", name: "Organization & Master Data", note: "Organization sebagai tenant root" },
  { code: "03", name: "People & Referee Management", note: "Profil kanonik multi-peran" },
  { code: "04", name: "Event / Match Licensing", note: "Requirement set konfigurabel" },
  { code: "05", name: "Referee Assignment", note: "Rekomendasi, keputusan tetap manusia" },
  { code: "06", name: "Honorarium", note: "Invoice → approval → settlement" },
  { code: "07", name: "Match Operations", note: "Match sheet futsal-specific" },
  { code: "08", name: "Audit & Governance", note: "Setiap keputusan dapat dijelaskan" },
];

const foundation = [
  "IDENTITY",
  "ORGANIZATION",
  "REGISTRATION",
  "LICENSING",
  "COMPETITION",
  "MATCH",
  "REFEREE",
  "FINANCE",
  "GOVERNANCE",
  "DATA",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <span className="grid size-7 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            FE
          </span>
          <span className="text-sm font-semibold tracking-tight">Futsal Ecosystem Platform</span>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/portal" className="text-muted-foreground hover:text-foreground">
              Portal Publik
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">
              Masuk
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-primary-foreground"
            >
              Buka Konsol <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="grid gap-10 border-b border-border py-16 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              FEP-MB-001 · MVP UI Shell
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Digital Operating Platform untuk Ekosistem Futsal
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Menghubungkan people, organizations, teams, competitions, licensing, matches,
              officials, finance, data, dan governance dalam satu platform multi-tenant yang
              auditable.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Masuk konsol operasional <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/portal"
                className="inline-flex items-center rounded border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Lihat portal publik
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
            {[
              { k: "Organizations", v: "4" },
              { k: "Registered people", v: "10" },
              { k: "Active referees", v: "3" },
              { k: "Competitions", v: "3" },
              { k: "Permits processed", v: "4" },
              { k: "Audit entries", v: "6" },
            ].map((s) => (
              <div key={s.k} className="bg-card p-4">
                <dt className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  {s.k}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-b border-border py-14">
          <h2 className="text-lg font-semibold tracking-tight">MVP Core — 8 modul</h2>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c) => (
              <li key={c.code} className="bg-card p-4">
                <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                <p className="mt-2 text-sm font-medium">{c.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-14">
          <h2 className="text-lg font-semibold tracking-tight">Fondasi arsitektur</h2>
          <ol className="mt-5 flex flex-wrap items-center gap-1.5">
            {foundation.map((f) => (
              <li
                key={f}
                className="rounded border border-border bg-card px-2.5 py-1 font-mono text-[11px] tracking-wide"
              >
                {f}
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
            Prinsip engineering: Blueprint → Domain → Contract → Implementation → Validation. Tahap
            ini adalah UI shell dengan data contoh; backend, RLS, dan audit sesungguhnya menyusul
            pada Golden Slice Organization.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          Futsal Ecosystem Platform · Master Blueprint v1.0 · UI shell
        </p>
      </footer>
    </div>
  );
}
