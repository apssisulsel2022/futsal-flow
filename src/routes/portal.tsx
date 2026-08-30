import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/kit";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal Publik Futsal — Klasemen & Jadwal" },
      {
        name: "description",
        content:
          "Portal publik ekosistem futsal: klasemen resmi, jadwal pertandingan, dan daftar kompetisi terverifikasi.",
      },
      { property: "og:title", content: "Portal Publik Futsal — Klasemen & Jadwal" },
      {
        property: "og:description",
        content: "Klasemen resmi, jadwal pertandingan, dan kompetisi futsal terverifikasi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalLayout,
});

const tabs = [
  { to: "/portal", label: "Ringkasan" },
  { to: "/portal/fixtures", label: "Jadwal & Hasil" },
  { to: "/portal/standings", label: "Klasemen" },
  { to: "/portal/teams", label: "Tim" },
] as const;

function PortalLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Portal Publik"
        description="Data read-only yang dipublikasikan dari hasil pertandingan tervalidasi."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app">Masuk ke platform</Link>
          </Button>
        }
      />

      <nav className="mt-5 flex flex-wrap gap-1 border-b border-border pb-px">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.to === "/portal" }}
            activeProps={{ className: "border-primary text-foreground" }}
            inactiveProps={{ className: "border-transparent text-muted-foreground" }}
            className="border-b-2 px-3 py-2 text-sm hover:text-foreground"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
