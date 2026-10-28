# DayLog

DayLog adalah personal dashboard privat berbasis Next.js untuk daily log, focus tracking, activity tracking, buku, serta movie/series.

## Menjalankan project

Gunakan Node.js dan npm, lalu siapkan environment lokal:

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

Isi variabel berikut di `.env` sebelum migration atau menjalankan aplikasi:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="minimal-32-characters"
PERSONAL_USERNAME="..."
PERSONAL_PASSWORD="minimal-8-characters"
APP_TIMEZONE="Asia/Jakarta"
```

Tidak ada registrasi pengguna. Login memakai satu pasang username/password privat dari environment.

## Update Thoughts untuk database yang sudah dipakai

Modul Thoughts tersedia di `/thoughts`, terpisah dari jurnal harian dan catatan buku/media. Editor mendukung bold, italic, tautan, highlight, dan gambar; perubahan disimpan dengan tombol Save/Update. Di mobile, Library dan Thoughts tersedia melalui menu More.

Migration baru `drizzle/0001_thoughts.sql` hanya menambah tabel `thoughts` beserta indeks waktu edit. Sebelum memakai modul ini, buat backup atau branch Neon, pastikan `DATABASE_URL` di `.env` menunjuk database yang dituju, lalu jalankan:

```bash
npm run db:migrate
```

Gunakan riwayat migration yang sudah ada; jangan reset database, mengubah migration `0000_daylog_foundation.sql`, atau memakai schema push. Tidak ada variabel environment baru untuk Thoughts. Setelah migration, verifikasi pembuatan, pengeditan, upload gambar, dan penghapusan catatan melalui aplikasi.

## Penyimpanan gambar

Cover buku, cover media, dokumentasi media, dan gambar Thoughts disimpan langsung di Neon PostgreSQL melalui tabel `stored_assets` (`bytea`). Aplikasi tidak menggunakan Vercel Blob atau filesystem persisten. Upload menerima JPEG, PNG, dan WebP hingga 1.5 MB; aset hanya dapat dibaca oleh sesi yang terautentikasi.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

