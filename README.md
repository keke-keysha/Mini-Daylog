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

## Penyimpanan gambar

Cover buku, cover media, dan dokumentasi media disimpan langsung di Neon PostgreSQL melalui tabel `stored_assets` (`bytea`). Aplikasi tidak menggunakan Vercel Blob atau filesystem persisten. Upload menerima JPEG, PNG, dan WebP hingga 1.5 MB; aset hanya dapat dibaca oleh sesi yang terautentikasi.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

1. Buat database Neon dan isi `DATABASE_URL` lokal.
2. Jalankan `npm run db:migrate` untuk menerapkan migration.
3. Tambahkan seluruh environment variables di atas ke project Vercel.
4. Deploy project ke Vercel. Tidak diperlukan Blob store atau `BLOB_READ_WRITE_TOKEN`.
