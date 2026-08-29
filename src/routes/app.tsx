import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/context/app-state";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Konsol Operasional — Futsal Ecosystem Platform" },
      {
        name: "description",
        content:
          "Konsol operasional multi-tenant untuk organisasi, perizinan, wasit, pertandingan, honorarium, dan audit futsal.",
      },
      { property: "og:title", content: "Konsol Operasional — Futsal Ecosystem Platform" },
      {
        property: "og:description",
        content: "Satu konsol untuk identitas, organisasi, kompetisi, wasit, keuangan, dan governance futsal.",
      },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppStateProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppStateProvider>
  );
}
