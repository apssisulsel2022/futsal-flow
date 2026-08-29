# Futsal Ecosystem Platform — MVP UI Shell

Membangun UI lengkap untuk 8 modul MVP sesuai blueprint, dengan data contoh (mock) di frontend. Belum ada backend, login nyata, atau database — struktur data dibuat agar mudah disambungkan ke Lovable Cloud nanti.

## Arah visual

Neutral Enterprise: permukaan terang (#F4F5F7), teks nyaris hitam (#101114), satu aksen indigo (#5B6CFF), abu-abu sekunder (#8A8F98). Radius kecil, tabel padat, tipografi bersih, motion minimal. Semua warna sebagai token semantik di `src/styles.css` (light + dark).

## Kerangka aplikasi

- Shell admin: sidebar navigasi bertingkat, topbar dengan tenant switcher (Organization sebagai tenant root), pemilih peran (Association Admin / EO / Referee / Team Manager), notification center, breadcrumb.
- Sidebar menyesuaikan peran aktif sesuai bagian 38 blueprint.
- Komponen lintas modul: DataTable (filter, pencarian, paginasi), StatusBadge untuk lifecycle DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → ACTIVE → COMPLETED → ARCHIVED (+ REJECTED/RESUBMITTED), Timeline approval, DocumentList, DetailDrawer, EmptyState, MetricCard, PageHeader.

## Halaman per modul MVP

1. Identity & Auth — halaman sign-in/sign-up (visual saja), profil identitas, sesi & perangkat, daftar role & permission (read-only matrix).
2. Organization / Master Data — daftar organisasi, detail organisasi (profil, hierarki, membership, policy), form buat organisasi, master data (kategori kompetisi, tipe permit, venue, court).
3. People & Referee Management — daftar Person kanonik dengan multi-profil (Player/Coach/Referee/Official) dalam satu identitas; detail Person dengan tab profil, dokumen, kualifikasi; modul Referee: lisensi & grade, availability calendar, eligibility, performance, riwayat penugasan.
4. Event / Match Licensing — daftar pengajuan permit, wizard pengajuan (requirement set konfigurabel: dokumen, venue, official, safety), antrean review dengan approve/reject + alasan, halaman permit terbit dengan nomor permit dan QR verification.
5. Referee Assignment — papan penugasan per match, panel rekomendasi wasit (skor availability, grade, jarak, beban kerja, conflict of interest) yang bersifat saran dengan konfirmasi manusia, status assign → confirm → attendance.
6. Honorarium — tarif honorarium, daftar honorarium per wasit/match, alur invoice → approval → payment → settlement, ringkasan periode keuangan.
7. Basic Match Operations — daftar kompetisi, fixtures, detail match; match sheet dengan lineup, match events (goal, kartu, substitution, timeout, accumulated fouls futsal), skor, match report, validasi & publikasi. Layout match sheet dioptimalkan untuk mobile.
8. Audit & Governance — audit trail (actor, action, resource, before/after, timestamp, reason, correlation ID), daftar policy & regulation, approval SLA, compliance & risk overview.

Plus: portal publik ringan (competitions, fixtures, results, standings, teams, players) yang membaca "public read model" mock terpisah dari data internal, dan dashboard analitik operasional/kompetisi/governance dengan angka contoh.

## Halaman utama (/)

Landing ringkas produk + entry ke dashboard dan portal publik.

## Catatan teknis

- Route TanStack Start di `src/routes/`; satu file route per halaman, `head()` unik (title/description/og) per route.
- Data contoh di `src/data/*.ts` dengan tipe TypeScript yang mengikuti bounded context (Organization, Person, Referee, PermitApplication, Match, MatchEvent, AuditEntry, dsb.), tiap entity operasional membawa `organizationId` agar tenant filtering sudah terpasang di UI.
- Peran & tenant aktif disimpan di React context (mock) sehingga UI benar-benar role-based dan tenant-scoped; catatan jelas bahwa ini bukan security boundary.
- Tanpa Lovable Cloud pada tahap ini. Saat siap, langkah berikutnya adalah Golden Slice Organization dengan auth, tabel + RLS, dan audit nyata.

## Di luar cakupan tahap ini

Backend/auth nyata, RLS, AI runtime, notifikasi nyata, pembayaran, integrasi eksternal, monorepo/packages, dan modul di luar 8 modul MVP.
