# Penyelesaian UI & Wiring

Build sudah hijau dan semua modul utama sudah ada. Sisa pekerjaan: melengkapi halaman yang belum dibuat, membuat aksi UI benar-benar bekerja (bukan tombol mati), dan merapikan metadata halaman.

## 1. Halaman yang belum ada

- Wizard pengajuan izin (`/app/licensing/new`): 4 langkah — data event, venue & jadwal, dokumen persyaratan, official & safety — dengan ringkasan sebelum submit. Tombol "Ajukan izin" di halaman Licensing diarahkan ke sini.
- Portal publik dipecah jadi beberapa halaman agar tiap bagian bisa dibagikan: `/portal` (ringkasan), `/portal/fixtures`, `/portal/standings`, `/portal/teams`. Nav portal sederhana di atas.
- Halaman not-found (catch-all) dengan tautan kembali ke dashboard dan portal.

## 2. Wiring interaksi (state lokal, data mock)

- Licensing review: Approve / Reject / Minta revisi memperbarui status permit + alasan, menambah entri timeline dan audit, lalu memunculkan toast.
- Referee assignment: memilih wasit dari panel rekomendasi mengisi slot official, lalu assign → confirm → attendance berjalan bertahap; blokir jika lisensi tidak aktif, beban kerja melebihi batas, atau ada conflict of interest.
- Match sheet: tambah/hapus match event (goal, kartu, foul, timeout, substitusi), skor terhitung otomatis, tombol validasi & publikasi mengubah status match dan mengunci editing.
- Honorarium: alur invoice → approval → payment → settlement per baris, ringkasan periode ikut berubah.
- Formulir organisasi & wizard izin: validasi field wajib, pesan error inline, submit menampilkan konfirmasi dan mengarah ke daftar.
- Tenant switcher & role switcher: filter data konsisten di seluruh halaman (mengikuti pola yang sudah ada di dashboard).
- Notification center: tandai dibaca / tandai semua dibaca.
- Filter di DataTable: filter status per modul (bukan hanya pencarian teks) di Licensing, Matches, People, Referees, Honorarium.

Semua perubahan tersimpan di store mock berbasis React context selama sesi (belum ada database), dan setiap aksi kritikal menulis entri audit mock supaya prinsip audit trail terlihat.

## 3. Metadata & polish

- `head()` unik (title, description, og:title, og:description) untuk setiap route `/app/*` dan portal.
- Toaster (sonner) dipasang sekali di root untuk feedback aksi.
- Cek responsif di mobile untuk match sheet, papan assignment, dan tabel padat.

## Catatan teknis

- Store mock: satu context provider (`src/context/mock-store.tsx`) yang meng-hydrate dari `src/data/mock.ts` dan mengekspos aksi (approvePermit, assignOfficial, addMatchEvent, advanceHonorarium, dst.) plus `appendAudit`. Halaman membaca lewat hook, bukan impor array langsung, agar update tampil reaktif.
- Route baru: `app.licensing.new.tsx`, `portal.index.tsx`, `portal.fixtures.tsx`, `portal.standings.tsx`, `portal.teams.tsx` (mengubah `portal.tsx` jadi layout dengan `<Outlet />`), dan `$.tsx` untuk not-found.
- Tetap tanpa backend. Semua state hilang saat refresh — ini disengaja untuk tahap UI.

## Di luar cakupan

Lovable Cloud, auth nyata, RLS, audit persisten, pembayaran, notifikasi nyata.
