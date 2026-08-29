import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockNotice } from "@/components/kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — Futsal Ecosystem Platform" },
      {
        name: "description",
        content:
          "Halaman masuk dan pendaftaran identitas digital untuk aktor ekosistem futsal: admin asosiasi, event organizer, wasit, dan manajer tim.",
      },
      { property: "og:title", content: "Masuk — Futsal Ecosystem Platform" },
      {
        property: "og:description",
        content: "Satu identitas digital untuk seluruh peran di ekosistem futsal.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("andi.rahman@example.id");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            FE
          </span>
          <span className="text-sm font-semibold tracking-tight">Futsal Ecosystem Platform</span>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">One Identity</h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Satu manusia tidak boleh memiliki identitas ganda hanya karena memiliki banyak peran.
            Player, Coach, Referee, dan Official berbagi satu Person ID.
          </p>
          <ul className="mt-6 space-y-2 font-mono text-xs text-muted-foreground">
            <li>PERSON</li>
            <li className="pl-4">├── Player</li>
            <li className="pl-4">├── Coach</li>
            <li className="pl-4">├── Referee</li>
            <li className="pl-4">└── Official</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Authentication belum aktif pada tahap UI shell.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">Akses platform</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan identitas terverifikasi organisasi Anda.
          </p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Kata sandi</Label>
                <Input id="password" type="password" defaultValue="••••••••••" />
              </div>
              <Button asChild className="w-full">
                <Link to="/app">Masuk ke konsol</Link>
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullname">Nama lengkap</Label>
                <Input id="fullname" placeholder="Sesuai dokumen identitas" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email2">Email</Label>
                <Input id="email2" placeholder="nama@organisasi.id" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org">Organisasi</Label>
                <Input id="org" placeholder="Nama klub / asosiasi / EO" />
              </div>
              <Button className="w-full" variant="secondary">
                Ajukan pendaftaran identitas
              </Button>
              <p className="text-xs text-muted-foreground">
                Pendaftaran masuk ke lifecycle DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED.
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <MockNotice>
              Halaman ini masih visual. Auth, sesi, dan verifikasi identitas akan aktif saat backend
              dinyalakan.
            </MockNotice>
          </div>
        </div>
      </div>
    </div>
  );
}
