# MASTER PROMPT — PERSONAL DASHBOARD

Saya ingin kamu bertindak sebagai **Senior Full-Stack Engineer, Software Architect, Database Designer, dan UI/UX Engineer** untuk mengembangkan aplikasi **Personal Dashboard** milik saya.

Aplikasi ini bersifat **PRIVATE / PERSONAL USE**, hanya digunakan oleh satu orang, dan menggabungkan konsep:

- Personal Log
- Daily Planner
- Habit / Activity Tracker
- Focus & Study Tracker
- Personal Library
- Reading Tracker
- Movie / Series Tracker
- Personal Data Hub

Aplikasi harus nyaman digunakan setiap hari, khususnya melalui smartphone.

---

# 0. CARA KERJA WAJIB

Sebelum menulis atau mengubah kode apa pun:

1. Baca seluruh struktur repository.
2. Baca `package.json`.
3. Identifikasi:
   - versi Next.js,
   - React,
   - TypeScript,
   - shadcn/ui,
   - Radix,
   - NextAuth,
   - Zod,
   - Sonner,
   - Recharts,
   - ORM yang sudah ada jika ada,
   - database package,
   - utility package,
   - package manager yang digunakan,
   - struktur App Router yang sudah tersedia.
4. Jangan mengganti dependency yang sudah bekerja tanpa alasan kuat.
5. Tambahkan dependency hanya jika memang dibutuhkan.
6. Gunakan package manager yang sudah digunakan project berdasarkan lockfile.
7. Jangan melakukan downgrade package.
8. Jangan mengubah arsitektur existing secara destruktif jika tidak diperlukan.
9. Jangan membuat implementasi palsu, mock-only, atau TODO yang belum berfungsi.
10. Semua fitur harus benar-benar terhubung ke database dan persisten.

Jika project belum memiliki ORM:

**gunakan Drizzle ORM + Neon PostgreSQL sebagai default.**

Jika ternyata repository sudah menggunakan Prisma atau ORM lain dengan benar:

**pertahankan ORM tersebut. Jangan migrasi hanya demi mengikuti preferensi default.**

Gunakan Next.js App Router dan pola terbaru yang kompatibel dengan versi Next.js yang terpasang.

Prioritaskan Server Components untuk rendering data, lalu gunakan Client Components hanya jika membutuhkan:

- interaksi,
- form state,
- dialog,
- animation,
- optimistic update,
- chart,
- input pengguna.

---

# 1. WORKFLOW GIT

Project sudah merupakan repository Git.

Setiap stage besar yang selesai HARUS dibuatkan commit.

Gunakan commit yang jelas dan ringkas menggunakan pola seperti:

```text
feat: setup authentication and database
feat: build responsive dashboard shell
feat: implement daily module
feat: implement focus module
feat: implement activity tracker
feat: implement book library
feat: implement movie library
feat: integrate dashboard data
refactor: improve responsive ui and interactions
fix: resolve validation and production build issues
```

ATURAN GIT:

- Commit setiap stage.
- Jangan `git push`.
- Jangan melakukan force push.
- Jangan menghapus history Git.
- Jangan commit `.env`.
- Jangan stage file yang tidak berkaitan jika sebelumnya sudah terdapat perubahan milik saya.
- Jangan reset perubahan milik saya.
- Deployment akan saya lakukan sendiri ke Vercel.

Setelah seluruh project selesai:

```bash
git status
git log --oneline -n 15
```

Pastikan working tree bersih untuk file yang kamu sendiri kerjakan jika memungkinkan.

---

# 2. TECH STACK WAJIB

Gunakan stack berikut.

## Core

- Next.js — gunakan versi yang sudah tersedia di project
- React
- TypeScript strict
- App Router

## Database

- Neon PostgreSQL

Gunakan `DATABASE_URL`.

Jika belum ada ORM:

- Drizzle ORM
- drizzle-kit
- `@neondatabase/serverless`

Jika ORM sudah ada, pertahankan.

## Authentication

Gunakan:

- NextAuth / Auth.js melalui package `next-auth`
- Credentials authentication
- username + password
- JWT session

Aplikasi tidak membutuhkan:

- register
- email
- email verification
- forgot password
- OAuth
- multiple user management

Ini adalah aplikasi personal untuk satu pengguna saja.

Credentials diambil dari `.env`.

## UI

Gunakan:

- shadcn/ui
- Radix UI
- Lucide Icons

Gunakan komponen shadcn seperti:

- Button
- Card
- Dialog
- AlertDialog
- Sheet
- DropdownMenu
- Input
- Textarea
- Checkbox
- Select
- Progress
- Popover
- Calendar
- Tabs / ToggleGroup jika dibutuhkan
- Skeleton
- Tooltip

Jangan membuat ulang komponen kompleks yang sebenarnya sudah tersedia di shadcn/Radix.

## Validation

WAJIB menggunakan:

- Zod

JANGAN mengandalkan HTML native validation sebagai validator utama.

Gunakan:

```html
<form noValidate>
```

Validation harus berjalan minimal di server.

Untuk form kompleks, boleh menggunakan:

- React Hook Form
- `@hookform/resolvers/zod`

jika memang diperlukan.

Semua pesan validasi harus tampil dekat dengan field terkait.

---

# 3. TOASTER

Gunakan **Sonner** sebagai satu-satunya notification system.

Konfigurasi global:

- duration: `1500 ms`
- `closeButton={false}`
- gunakan style konsisten
- jangan gunakan `alert()`
- jangan menggunakan notification system lain.

Sonner HARUS digunakan untuk semua interaksi penting:

- login berhasil
- login gagal
- logout
- create
- update
- delete
- save journal
- mood updated
- todo created
- todo completed
- todo edited
- task completed
- activity created
- book updated
- movie updated
- quote created/deleted
- upload berhasil/gagal
- error database
- error validation jika sesuai

Contoh pesan:

```text
Todo added
Todo updated
Mood updated
Journal saved
Task completed
Activity added
Book updated
Movie updated
Quote added
Changes saved
Something went wrong
```

Jangan membuat toast terlalu panjang.

---

# 4. CHART

Semua visualisasi grafik menggunakan:

- Recharts

Chart harus:

- responsive,
- menggunakan `ResponsiveContainer`,
- readable di mobile,
- mempunyai tooltip,
- tidak overflow,
- menggunakan data asli database.

Jangan menggunakan library chart lain.

---

# 5. FILE STORAGE

Aplikasi memiliki upload:

- cover buku,
- cover film/series,
- dokumentasi film/series.

JANGAN menyimpan file ke filesystem Next.js/Vercel secara permanen.

Sesuai keputusan arsitektur project, JANGAN gunakan Vercel Blob. Simpan file langsung di Neon PostgreSQL pada tabel aset khusus menggunakan kolom `bytea` beserta metadata MIME, ukuran, dan nama asli. Model Book/Media hanya menyimpan foreign key aset.

File disajikan melalui Route Handler terautentikasi berdasarkan ID aset. Response harus memakai MIME yang tersimpan, `X-Content-Type-Options: nosniff`, dan cache private.

Validasi file menggunakan server-side validation.

Supported:

```text
image/jpeg
image/png
image/webp
```

Maksimum sekitar:

```text
1.5 MB
```

Validasi MIME, ukuran, dan signature file di server. Gunakan UUID untuk ID aset dan pastikan endpoint upload maupun pembacaan aset hanya bisa digunakan user yang sudah login.

---

# 6. ENVIRONMENT VARIABLES

Saya meminta dibuatkan file:

```text
.env
```

BUKAN hanya `.env.example`.

`.env` harus sudah masuk `.gitignore`.

Minimal isinya:

```env
DATABASE_URL=""

AUTH_SECRET=""

PERSONAL_USERNAME=""
PERSONAL_PASSWORD=""

APP_TIMEZONE="Asia/Jakarta"
```

Jika versi NextAuth yang terinstall membutuhkan nama environment variable berbeda seperti `NEXTAUTH_SECRET`, sesuaikan dengan versi yang memang terpasang.

Jangan menggunakan environment variable deprecated jika versi saat ini sudah mempunyai penggantinya.

Buat helper environment validation menggunakan Zod.

Contoh lokasi:

```text
src/lib/env.ts
```

Semua secret WAJIB server-only.

JANGAN menggunakan prefix:

```text
NEXT_PUBLIC_
```

untuk:

- database URL,
- password,
- username auth,
- auth secret,
- Blob token.

---

# 7. AUTHENTICATION

Buat login page:

```text
/login
```

Form hanya:

```text
Username
Password
Login
```

Tidak perlu:

- Register
- Email
- Forgot Password

Credentials dibandingkan dengan:

```text
PERSONAL_USERNAME
PERSONAL_PASSWORD
```

dari environment variable.

Credentials tidak boleh pernah dikirim kembali ke client.

Jangan log password ke console.

Gunakan session JWT.

Semua halaman selain login dan endpoint NextAuth harus protected.

Minimal protected:

```text
/
/daily
/daily/calendar
/focus
/tracker
/library
/library/books
/library/books/*
/library/movies
/library/movies/*
```

Selain proteksi route-level, semua Server Action / API mutation tetap harus mengecek session.

Jangan mengandalkan middleware/proxy saja sebagai authorization.

Jika versi Next.js sekarang menggunakan convention `proxy.ts`, ikuti convention versi tersebut.

Setelah login:

```text
redirect -> /
```

Jika user authenticated membuka `/login`:

```text
redirect -> /
```

Logout:

- hapus session,
- redirect `/login`,
- tampilkan Sonner notification yang sesuai jika flow memungkinkan.

---

# 8. TIMEZONE DAN DATE

Aplikasi ini digunakan di:

```text
Asia/Jakarta
```

Jangan mengandalkan UTC sebagai definisi "hari ini".

Buat utility date terpusat.

Gunakan:

```text
dd-MM-yyyy
```

untuk display tanggal.

Database:

- tanggal logis harian sebaiknya menggunakan PostgreSQL `date`,
- timestamp tetap UTC.

Contoh:

```text
date = 2026-09-16
```

Display:

```text
16-09-2026
```

Semua logic:

- today's mood,
- today's todo,
- dashboard greeting,
- weekly tracker,
- reading progress,

harus konsisten berdasarkan Asia/Jakarta.

---

# 9. NAVIGATION & RESPONSIVE DESIGN

## MOBILE FIRST

Prioritas tertinggi adalah smartphone.

Gunakan bottom navigation fixed layaknya aplikasi mobile.

Bottom navigation:

```text
Home
Daily
Focus
Tracker
Library
```

Gunakan icon Lucide + label pendek.

Bottom nav harus:

- fixed,
- mudah dijangkau ibu jari,
- memiliki active state,
- mempunyai safe-area padding,
- tidak menutupi content.

Content bagian bawah harus memiliki padding yang cukup agar tidak tertutup bottom navigation.

Target minimal tap area:

```text
44px
```

## DESKTOP

Pada desktop gunakan:

- sidebar,
atau
- desktop navigation yang masuk akal.

Desktop tidak perlu memaksakan bottom navigation.

Jangan membuat desktop terlihat seperti mobile stretched.

---

# 10. DESIGN LANGUAGE

Desain yang saya inginkan:

- clean,
- calm,
- modern,
- personal,
- productivity dashboard,
- tidak terlalu corporate,
- tidak terlalu banyak dekorasi,
- information density tetap nyaman,
- whitespace rapi,
- rounded corner konsisten,
- typography hierarchy jelas.

Gunakan semantic colors dari shadcn.

Hindari:

- gradient berlebihan,
- shadow terlalu berat,
- terlalu banyak border,
- animasi berlebihan,
- layout yang terlihat seperti admin template generik.

Yang saya maksud **container** pada requirement adalah **section**.

Gunakan semantic HTML:

```html
<section>
<header>
<main>
<nav>
```

jika sesuai.

---

# 11. DATABASE MODEL

Desain schema dengan relasi dan indexes yang baik.

Jangan menyimpan JSON besar untuk data yang seharusnya relational.

Berikut konsep minimal yang harus tersedia.

---

## APP SETTINGS

Singleton table.

Field konsep:

```text
id
firstUsedDate
createdAt
updatedAt
```

`firstUsedDate` digunakan untuk menentukan batas kalender Daily.

Tanggal sebelum pertama kali aplikasi digunakan tidak perlu tersedia.

---

# DAILY DATABASE

## DailyEntry

```text
id
date UNIQUE
mood
journal
createdAt
updatedAt
```

Mood enum:

```text
SAD
FLAT
HAPPY
ANGRY
```

Default mood:

```text
FLAT
```

Jika suatu tanggal belum memiliki record mood, UI tetap memperlakukannya sebagai `FLAT`.

---

## DailyTodo

```text
id
dailyEntryId
text
isCompleted
sortOrder
createdAt
updatedAt
```

Relasi:

```text
DailyEntry 1:N DailyTodo
```

Delete todo harus tersedia melalui action yang tidak mengganggu tampilan utama.

Gunakan confirmation jika destructive.

---

# FOCUS DATABASE

## FocusMaterial

```text
id
title
createdAt
updatedAt
```

## FocusSubtopic

```text
id
materialId
title
isCompleted
sortOrder
createdAt
updatedAt
```

## FocusTask

```text
id
materialId
title
deadline
isCompleted
createdAt
updatedAt
```

Relationship:

```text
FocusMaterial 1:N FocusSubtopic
FocusMaterial 1:N FocusTask
```

Progress suatu material dihitung dari:

```text
completed subtopics / total subtopics
```

Jika belum ada subtopic:

```text
0%
```

FocusTask tidak ikut menghitung persentase materi.

---

# TRACKER DATABASE

Pisahkan status harian dengan aktivitas agar satu hari dapat mempunyai lebih dari satu aktivitas.

## TrackerDay

```text
id
date UNIQUE
isFasting
isSick
isRedDay
createdAt
updatedAt
```

## ActivityLog

```text
id
trackerDayId
activity
distanceKm
durationMinutes
paceSecondsPerKm
createdAt
updatedAt
```

Relasi:

```text
TrackerDay 1:N ActivityLog
```

Satu tanggal boleh mempunyai beberapa aktivitas.

Contoh:

```text
Running
Walking
Cycling
Gym
```

`activity` tidak harus enum supaya fleksibel.

`distanceKm` boleh nullable jika aktivitas tidak menggunakan distance.

`paceSecondsPerKm` juga boleh nullable.

---

# BOOK DATABASE

## Book

Minimal:

```text
id
title
author
genre
ownership
coverUrl
totalPages
currentPage
rating
thoughts
startedAt
completedAt
createdAt
updatedAt
```

`ownership` optional.

Rating:

```text
1-5
```

Rating nullable sampai buku selesai.

`currentPage`:

```text
0 <= currentPage <= totalPages
```

Jika:

```text
currentPage === totalPages
```

maka buku completed.

Set `completedAt` ketika pertama kali mencapai 100%.

Jika progress turun lagi karena user memperbaiki data, jangan sembarangan menghancurkan history yang sudah tersedia.

---

## BookQuote

```text
id
bookId
quote
createdAt
updatedAt
```

Relasi:

```text
Book 1:N BookQuote
```

---

## BookProgressLog

Digunakan untuk histori membaca.

Minimal:

```text
id
bookId
date
previousPage
newPage
pagesDelta
createdAt
```

Ketika user mengubah:

```text
currentPage: 120 -> 145
```

buat progress event:

```text
previousPage = 120
newPage = 145
pagesDelta = 25
```

Sehingga statistik hari tersebut:

```text
25 pages read
```

Progress harus tercatat pada saat tombol **Update** ditekan, bukan hanya karena input berubah.

Jangan membuat progress event jika nilai halaman tidak berubah.

Jika nilai dikoreksi turun:

```text
145 -> 140
```

anggap sebagai correction dan jangan menampilkan angka negatif sebagai "pages read".

Pastikan analytics tidak menghasilkan jumlah halaman dibaca yang menyesatkan akibat correction.

---

# MOVIE / SERIES DATABASE

Gunakan istilah model yang jelas seperti:

```text
Media
```

atau pisahkan `MovieSeries`.

Minimal field:

```text
id
title
genre
category
country
recommendedBy
coverUrl
documentationUrl
totalEpisodes
watchedEpisodes
rating
thoughts
startedAt
completedAt
createdAt
updatedAt
```

Category enum:

```text
MOVIE
SERIES
```

`recommendedBy` optional.

`documentationUrl` optional.

Untuk SERIES:

```text
totalEpisodes required
watchedEpisodes required
```

Untuk MOVIE:

```text
totalEpisodes null
watchedEpisodes null
progress = 100%
```

---

## MediaQuote

```text
id
mediaId
quote
createdAt
updatedAt
```

---

## MediaProgressLog

Untuk SERIES:

```text
id
mediaId
date
previousEpisodes
newEpisodes
episodeDelta
createdAt
```

Jangan membuat progress log jika episode tidak berubah.

---

# 12. HOME / DASHBOARD

Route:

```text
/
```

Dashboard merupakan ringkasan dari seluruh aplikasi.

Bagian paling atas:

## GREETING BANNER

Tampilkan salam pendek berdasarkan waktu Asia/Jakarta.

Contoh:

```text
Good morning, Anas
Good afternoon, Anas
Good evening, Anas
```

Nama bisa diambil dari username session.

Jangan membuat banner terlalu tinggi.

---

Di bawahnya terdapat EMPAT widget:

```text
Daily
Focus
Tracker
Library
```

Semua harus memiliki visual weight dan ukuran yang konsisten.

Desktop:

```text
2 x 2 grid
```

Mobile:

```text
1 column
```

Gunakan min-height konsisten agar terlihat rapi.

Semua widget dapat diklik menuju modul terkait.

Tetapi interactive controls di dalam card seperti checkbox tidak boleh memicu navigasi card secara tidak sengaja.

Gunakan `stopPropagation` atau struktur link yang tepat.

---

# 13. DASHBOARD — DAILY WIDGET

Tampilkan:

### To Do List hari ini

Ambil data DailyTodo untuk hari ini.

Jika kosong tampilkan:

```text
Set to do list now
```

Klik empty-state dapat menuju:

```text
/daily
```

Todo cukup berupa list ringkas.

Di bawahnya:

## Today's Mood

Tampilkan empat emoji:

```text
😔 Sad
😐 Flat
😊 Happy
😠 Angry
```

Boleh hanya emoji pada dashboard jika ruang sempit.

User dapat memilih satu.

Jika dipilih:

- background / warna emoji menjadi lebih kuat,
- selected state jelas,
- pilihan lain kembali normal.

Pilihan mood dapat diganti kapan saja.

Setiap perubahan langsung disimpan.

---

# 14. DASHBOARD — FOCUS WIDGET

Ambil seluruh FocusTask yang:

```text
isCompleted = false
```

Gabungkan dari SEMUA FocusMaterial.

Sort:

1. overdue paling dahulu,
2. deadline paling dekat,
3. deadline lebih jauh.

Container harus dapat discroll secara internal jika task banyak.

Setiap task tampilkan:

```text
Task title
Material title
Deadline
Finished button / checkbox
```

User dapat langsung menandai finished dari dashboard.

Setelah finished:

- update database,
- hilangkan / ubah state task,
- update progress UI,
- Sonner.

---

# 15. DASHBOARD — TRACKER WIDGET

Karena dashboard mempunyai widget dari setiap menu, buat Tracker widget sebagai summary singkat.

Tampilkan minimal:

```text
Last activity
Distance this week
Duration this week
```

Jika belum ada aktivitas:

```text
No activity logged yet
```

Widget dapat diklik ke:

```text
/tracker
```

Jangan memasukkan chart besar ke widget dashboard.

---

# 16. DASHBOARD — LIBRARY WIDGET

Tampilkan:

## Currently Reading

Ambil satu buku dengan:

```text
currentPage < totalPages
```

prioritaskan yang paling baru di-update.

Tampilkan:

```text
Title
currentPage / totalPages
progress %
```

---

## Currently Watching

Prioritaskan SERIES yang belum selesai:

```text
watchedEpisodes < totalEpisodes
```

dan paling baru di-update.

Tampilkan:

```text
Title
watchedEpisodes / totalEpisodes
progress %
```

Jika masing-masing kosong, tampilkan empty state sederhana.

---

# 17. DAILY PAGE

Route:

```text
/daily
```

Header:

```text
Daily
                         dd-MM-yyyy
```

Tanggal kanan atas dapat diklik.

Klik tanggal menuju:

```text
/daily/calendar
```

Ada TIGA section utama.

---

# 18. DAILY — TODAY'S MOOD

Section pertama:

```text
Today's Mood
```

Tampilkan empat pilihan besar:

```text
😔 Sad
😐 Flat
😊 Happy
😠 Angry
```

Mapping:

```text
Sad   -> blue
Flat  -> yellow / amber
Happy -> green
Angry -> red
```

Gunakan tone yang tetap terbaca di light/dark mode.

Interaction:

### Hover / desktop

Emoji sedikit:

```text
translateY(-2px)
scale(1.05)
```

### Press / mobile

Gunakan active animation singkat.

### Selected

- warna lebih pekat,
- scale kecil,
- ring/background selected,
- selected state sangat jelas.

Gunakan CSS transition / animation sederhana.

Tidak perlu menambah animation library hanya untuk ini.

User selalu dapat mengganti mood.

Mood baru menggantikan mood sebelumnya untuk tanggal tersebut.

Semua perubahan persisten.

Jika tidak pernah dipilih:

```text
Flat
```

---

# 19. DAILY — TODO LIST

Section kedua:

```text
To Do List
```

Tampilkan seluruh todo hari tersebut.

Struktur:

```text
☐ Belajar basis data
☑ Kerjakan laporan
+ Add todo
```

Tanda `+` selalu berada di bagian bawah.

Klik `+`:

- tampilkan inline input,
- user mengetik,
- Enter / tombol save menambahkan todo.

Todo tersimpan ke database.

Todo mempunyai checkbox.

Jika checked:

```text
isCompleted = true
```

UI:

- redupkan item,
- boleh menggunakan line-through tipis,
- jangan sampai teks tidak terbaca.

Todo yang sudah tersimpan dapat diedit.

Contoh:

klik teks atau edit action -> inline edit.

Harus ada cara delete tetapi jangan membuat tampilan penuh icon.

Gunakan:

- hover action,
- context menu,
- atau small dropdown.

Delete menggunakan confirmation.

---

Di bagian bawah kanan section tampilkan:

```text
2 / 5 complete
```

Style:

- text kecil,
- muted,
- tipis.

Update real-time setelah checkbox berubah.

---

# 20. DAILY — QUICK JOURNALING

Section ketiga:

```text
Quick Journaling
```

Textarea besar dengan placeholder EXACT:

```text
What’s happening…
```

Harus mendukung long paragraph.

Tambahkan:

```text
Save
```

Jangan autosave setiap karakter.

Hanya simpan ketika user menekan Save.

Setelah berhasil:

```text
Journal saved
```

melalui Sonner.

Jika journal sudah pernah ada:

- tampilkan isi terakhir.
- user dapat mengedit.
- Save melakukan update.

---

# 21. DAILY CALENDAR

Route:

```text
/daily/calendar
```

Calendar mencakup:

```text
bulan pertama website digunakan
sampai
bulan sekarang
```

Jangan mengizinkan navigasi ke masa sebelum `firstUsedDate`.

Jangan perlu menampilkan bulan masa depan.

Mobile:

- satu bulan per viewport,
- previous / next navigation.

Desktop boleh lebih lebar.

---

## DATE CELL

Setiap tanggal menggunakan background berdasarkan mood:

```text
Sad   -> blue
Flat  -> yellow
Happy -> green
Angry -> red
```

Jika tanggal tidak mempunyai mood:

```text
Flat
```

Jadi default visual = Flat.

Di setiap tanggal tampilkan teks kecil:

```text
2/5
```

Artinya:

```text
completed todo / total todo
```

Gunakan teks kecil dan subtle.

Jika tidak ada todo:

```text
0/0
```

boleh dibuat sangat samar.

---

## DATE DETAIL

Ketika tanggal diklik:

buka shadcn Dialog.

Bagian paling atas tengah:

```text
mood emoji
```

Di bawahnya:

```text
date
quick journal
```

Contoh:

```text
😊

12-09-2026

Hari ini belajar database dan menyelesaikan...
```

Jika journal kosong:

```text
No journal entry
```

Jangan membuka halaman baru untuk detail ini.

---

# 22. FOCUS PAGE

Route:

```text
/focus
```

Tujuan Focus adalah mengorganisasi:

```text
Material
  ├── Subtopics
  └── Tasks + deadline
```

Tampilkan grid/list FocusMaterial.

Setiap container Material menampilkan:

```text
Material title
Progress bar
XX%
```

Contoh:

```text
Basis Data

████████░░ 80%
```

Progress:

```text
completedSubtopic / totalSubtopic
```

Jika tidak mempunyai subtopic:

```text
0%
```

---

Di paling bawah / akhir daftar terdapat:

```text
+ New Material
```

Klik membuka dialog create material.

Material harus bisa:

- create
- rename
- delete

Delete gunakan confirmation karena subtopic/task ikut terdampak.

---

# 23. FOCUS MATERIAL DETAIL

Klik container material membuka:

**Dialog / Sheet responsive.**

Desktop:

```text
Dialog
```

Mobile boleh:

```text
full-height Sheet
```

Tampilkan:

```text
Material title
Progress
Subtopics
Tasks
```

---

## SUBTOPICS

List:

```text
☐ ERD
☑ Normalization
☐ SQL Join

+ Add subtopic
```

Checkbox true:

```text
isCompleted = true
```

Completed:

- muted,
- sedikit gelap/reduced opacity,
- optional line-through.

Semua changes persisten.

Subtopic dapat:

- create
- edit
- complete/uncomplete
- delete.

---

# 24. FOCUS TASK

Di bawah subtopic:

```text
Tasks
```

Task mirip todo, tetapi WAJIB mempunyai:

```text
title
deadline
```

Contoh:

```text
☐ Kerjakan LKP 5
   18-09-2026
```

Tambahkan:

```text
+ Add task
```

Form:

```text
Task title
Deadline
```

Deadline wajib.

Gunakan date picker berbasis shadcn/Radix, bukan browser UI yang tidak konsisten jika date picker custom sudah tersedia.

FocusTask dapat:

- create
- edit
- mark finished
- mark unfinished
- delete.

Task inilah yang muncul di:

```text
Dashboard -> Focus Widget
```

---

# 25. TRACKER PAGE

Route:

```text
/tracker
```

Urutan halaman WAJIB:

```text
1. Activity Chart
2. Activity Log
3. Weekly Summary
4. Add Activity Form
```

Jangan mengacak urutan ini.

---

# 26. TRACKER — CHART

Paling atas tampilkan chart Recharts.

Chart menggambarkan tren aktivitas dari waktu ke waktu.

Sediakan metric selector:

```text
Distance
Duration
Pace
```

Default:

```text
Distance
```

Chart aggregate per hari.

Jika satu hari memiliki dua aktivitas:

```text
Running 3 km
Walking 2 km
```

Distance hari tersebut:

```text
5 km
```

Duration juga dijumlahkan.

Untuk Pace jangan menjumlahkan pace.

Gunakan average yang masuk akal berdasarkan aktivitas yang mempunyai pace.

Chart:

- responsive,
- tooltip,
- axis readable,
- tidak overflow mobile.

Jika belum ada data tampilkan meaningful empty state, bukan chart rusak.

---

# 27. TRACKER — ACTIVITY LOG

Di bawah chart tampilkan:

```text
Activity Log
```

Desktop menggunakan table.

Kolom utama EXACT:

```text
Date
Activity
Distance
Duration
Pace
```

Contoh:

```text
16-09-2026 | Running | 5.00 km | 31 min | 06:12 /km
```

Jangan menambah column:

```text
Fasting
Sick
Red Day
```

Status direpresentasikan dengan warna background ROW.

---

## STATUS COLORS

Buat legend kecil di dekat tabel.

Contoh semantic treatment:

```text
Fasting -> amber
Sick    -> orange/red muted
Red Day -> rose
Normal  -> default
```

Pastikan tetap accessible di dark mode.

Karena status menggunakan checkbox dan beberapa status dapat aktif bersamaan, gunakan deterministic priority untuk background:

```text
Red Day
> Sick
> Fasting
> Normal
```

Status tetap disimpan semuanya di database.

Background hanya menggunakan status dengan priority tertinggi.

---

Klik sebuah row dapat membuka detail/edit Activity.

Dari sana activity dapat:

- edit,
- delete.

Delete gunakan confirmation.

Mobile:

Jika table terlalu lebar:

- gunakan horizontal scroll yang nyaman,
atau
- responsive table strategy,

tetapi jangan membuang kolom penting.

---

# 28. TRACKER — WEEKLY SUMMARY

Setelah table:

```text
Weekly Summary
```

Hitung tujuh hari terakhir termasuk hari ini.

Tampilkan dua metric utama:

```text
Total Distance
Total Duration
```

Contoh:

```text
18.4 km
2h 31m
```

Gunakan compact cards.

Data harus recalculated setiap aktivitas berubah.

---

# 29. TRACKER — ADD ACTIVITY

Section paling bawah:

```text
Add Activity
```

Form:

## Today's Status

Checkbox:

```text
Fasting
Sick
Red Day
```

Boleh memilih lebih dari satu.

---

## Activity Data

Fields:

```text
Date
Activity
Distance
Duration
Pace
```

Date default:

```text
today
```

Distance:

```text
kilometer
```

Duration simpan sebagai:

```text
minutes
```

tetapi tampilkan secara manusiawi ketika diperlukan.

Pace gunakan format:

```text
mm:ss /km
```

Internal database lebih baik disimpan sebagai:

```text
seconds per kilometer
```

agar mudah dihitung.

Contoh:

```text
05:30 /km
=> 330 seconds/km
```

Jika:

```text
distance > 0
duration > 0
```

boleh otomatis menghitung suggested pace.

Tetap beri kesempatan user mengedit jika diperlukan.

Ketika Submit berhasil:

1. Upsert TrackerDay.
2. Tambahkan ActivityLog.
3. Refresh Activity Table.
4. Refresh Chart.
5. Refresh Weekly Summary.
6. Sonner success.

Semua tanpa full browser reload jika memungkinkan.

---

# 30. LIBRARY OVERVIEW

Route:

```text
/library
```

Bagian atas:

dua opsi besar:

```text
Books
Movies
```

Klik:

```text
Books -> /library/books
Movies -> /library/movies
```

---

Di bawahnya:

## MONTHLY SUMMARY

Tampilkan:

```text
Books this month
Movies this month
```

Count buku yang sedang / selesai dibaca selama bulan tersebut.

Book dianggap aktif bulan tersebut jika misalnya:

- dibuat bulan itu,
- memiliki progress reading bulan itu,
- selesai bulan itu.

Movie/Series sama:

- dibuat,
- progress,
- completed pada bulan tersebut.

Gunakan bulan Asia/Jakarta.

---

# 31. LIBRARY — QUOTES OVERVIEW

Di bawah Monthly Summary:

```text
Quotes
```

Tampilkan quotes dari seluruh books + movie/series.

Format WAJIB:

```text
“Quote text”
— Book / Movie Title
```

Contoh:

```text
“Fear is the mind-killer.”
— Dune
```

Quotes container boleh scroll jika panjang.

Urutkan berdasarkan:

```text
newest quote first
```

Jangan menampilkan seluruh quote dalam satu horizontal line jika panjang.

---

# 32. BOOKS PAGE

Route:

```text
/library/books
```

Tampilkan collection dalam cover grid.

Mobile:

```text
2 column
```

Desktop dapat:

```text
4-6 columns
```

tergantung width.

Setiap item:

```text
Cover
Title
Author
Progress Bar
currentPage / totalPages
```

---

# 33. ADD BOOK CARD

Salah satu card berupa:

```text
empty cover
+
Add Book
```

Klik membuka Book Form.

Form:

```text
Cover upload
Title
Author
Genre
Ownership (optional)
Total pages
Current page
Quotes
```

`currentPage` default:

```text
0
```

Quotes mendukung lebih dari satu.

Contoh UI:

```text
Quotes

[ quote input             ]
+ Add quote

[ quote 1                 ] [delete]
[ quote 2                 ] [delete]
```

Di bagian bawah SELALU ada:

```text
Update / Save
```

Untuk new item label boleh:

```text
Add Book
```

Setelah tersimpan, perubahan berikutnya menggunakan:

```text
Update
```

---

# 34. BOOK UPDATE BEHAVIOR

Konsep penting:

Mengubah field di form **tidak langsung berarti data final tersimpan**.

Database diperbarui ketika user menekan:

```text
Update
```

Setelah update berhasil:

```text
Book updated
```

Data tetap persisten walaupun:

- browser ditutup,
- reload,
- logout,
- server restart.

Ketika buku dibuka lagi:

form harus berisi data terakhir yang tersimpan.

---

# 35. BOOK READING ANALYTICS

Setiap perubahan `currentPage` melalui tombol Update dicatat ke:

```text
BookProgressLog
```

Contoh:

Hari Senin:

```text
20 -> 42
pages read = 22
```

Hari Selasa:

```text
42 -> 70
pages read = 28
```

Analytics dapat menghasilkan:

```text
Monday  22
Tuesday 28
```

Ketika buku selesai:

```text
currentPage === totalPages
```

tambahkan bagian completed book.

---

# 36. COMPLETED BOOK

Jika progress 100%, form/detail menampilkan tambahan:

## Rating

5 star interactive:

```text
☆ ☆ ☆ ☆ ☆
```

Setelah memilih:

```text
★ ★ ★ ★ ☆
```

Value database:

```text
1-5
```

---

## Reading Analysis

Tampilkan:

```text
Reading duration
Average pages / reading day
```

Contoh:

```text
Finished in 14 days
Average 23 pages/day
```

Reading duration dihitung dari:

```text
startedAt -> completedAt
```

Minimal 1 hari.

Average pages/day:

gunakan positive reading progress events.

Jangan memasukkan correction negatif sebagai halaman yang dibaca.

Jika cukup data, tampilkan mini Recharts:

```text
Pages Read per Day
```

Jangan memaksakan chart jika datanya hanya satu point.

---

## Quotes

Tampilkan seluruh quote buku.

---

## Thoughts

Textarea long paragraph:

```text
Thoughts
```

Bisa di-edit dan disimpan melalui tombol Update.

---

# 37. MOVIES PAGE

Route:

```text
/library/movies
```

Gunakan visual collection mirip Books tetapi disesuaikan untuk movie/series.

Card:

```text
Cover
Title
Genre
Category
Progress
```

Tambahkan:

```text
+ Add Movie / Series
```

---

# 38. MOVIE / SERIES FORM

Fields:

```text
Cover image
Title
Genre
Category
Country
Recommended from (optional)
Documentation image (optional)
Quotes
```

Category:

```text
Movie
Series
```

---

# 39. CATEGORY = SERIES

Jika:

```text
category === SERIES
```

tampilkan:

```text
Total Episodes
Watched Episodes
Progress Bar
```

Formula:

```text
watchedEpisodes / totalEpisodes * 100
```

Validasi:

```text
0 <= watchedEpisodes <= totalEpisodes
```

Ketika episode berubah dan user menekan Update:

buat:

```text
MediaProgressLog
```

Contoh:

```text
4 -> 7
episodeDelta = 3
```

Jika:

```text
watchedEpisodes === totalEpisodes
```

status completed.

---

# 40. CATEGORY = MOVIE

Jika:

```text
category === MOVIE
```

tidak perlu:

```text
Total Episodes
Watched Episodes
```

Progress langsung:

```text
100%
```

Anggap movie sudah ditonton ketika dimasukkan ke library ini.

---

# 41. COMPLETED MOVIE / SERIES

Jika progress:

```text
100%
```

tampilkan:

## Rating

```text
1-5 stars
```

## Thoughts

Long paragraph.

## Watch Analysis

Tampilkan minimal:

```text
Completed in X days
```

Untuk series boleh juga menampilkan:

```text
Average episodes / active day
```

jika datanya tersedia dan dapat dihitung secara akurat.

## Quotes

Tampilkan seluruh quotes yang tersimpan.

Semua tetap editable.

Tombol:

```text
Update
```

selalu tersedia.

---

# 42. QUOTES CRUD

Quotes pada Books dan Movie/Series harus benar-benar entities terpisah.

User dapat:

- create,
- update,
- delete.

Delete quote tidak boleh menghapus Book/Media.

Gunakan confirmation ringan jika perlu.

Quotes otomatis muncul di:

```text
/library
```

tanpa perlu input ulang.

---

# 43. DATA FLOW DASHBOARD

JANGAN membuat data dashboard sebagai data terpisah.

Dashboard HARUS mengambil source of truth dari modules.

Contoh:

```text
Daily widget
<- DailyEntry + DailyTodo

Focus widget
<- FocusTask

Tracker widget
<- TrackerDay + ActivityLog

Library widget
<- Book + Media
```

Jangan menduplikasi data.

Jika task selesai di Dashboard:

```text
/focus
```

harus langsung merefleksikan perubahan.

Jika mood berubah di Dashboard:

```text
/daily
/daily/calendar
```

harus menggunakan mood baru yang sama.

---

# 44. EMPTY STATES

Setiap module harus mempunyai empty state.

Contoh:

Daily:

```text
Set to do list now
```

Focus:

```text
No focus material yet
Create your first material.
```

Tracker:

```text
No activity logged yet.
```

Books:

```text
No books yet.
Add your first book.
```

Movies:

```text
No movies or series yet.
```

Dashboard Focus:

```text
No upcoming tasks.
```

Jangan menampilkan section kosong tanpa penjelasan.

---

# 45. LOADING STATES

Gunakan:

- Skeleton,
- loading.tsx,
- button loading state.

Semua form submission harus:

- disable tombol sementara request,
- mencegah double submit,
- menunjukkan spinner/loading kecil.

Contoh:

```text
Update
-> Saving...
```

---

# 46. ERROR HANDLING

Jangan swallow error.

Tangani:

- database unavailable,
- invalid input,
- upload failure,
- auth failure,
- data not found,
- unauthorized mutation.

Server tidak boleh mengirim raw database error ke user.

UI:

```text
Something went wrong
```

Sonner.

Console server boleh memiliki error teknis yang aman.

Jangan log:

- password,
- auth token,
- DATABASE_URL,
- secret.

---

# 47. ZOD VALIDATION

Buat schemas terpisah.

Contoh organisasi:

```text
src/lib/validations/
  auth.ts
  daily.ts
  focus.ts
  tracker.ts
  book.ts
  media.ts
```

Contoh constraints:

Todo:

```text
trim
min 1
max reasonable
```

Material:

```text
min 1
```

Distance:

```text
>= 0
```

Duration:

```text
> 0
```

Book:

```text
totalPages > 0
0 <= currentPage <= totalPages
rating 1..5
```

Series:

```text
totalEpisodes > 0
0 <= watchedEpisodes <= totalEpisodes
```

Semua mutation harus divalidasi ulang di server meskipun sudah divalidasi client.

---

# 48. CRUD RULE

Untuk entity yang memang dikelola user, berikan CRUD yang lengkap tanpa membuat UI berantakan.

Minimal:

### Daily Todo

```text
Create
Read
Update
Delete
Toggle
```

### Focus Material

```text
Create
Read
Update
Delete
```

### Focus Subtopic

```text
Create
Read
Update
Delete
Toggle
```

### Focus Task

```text
Create
Read
Update
Delete
Toggle
```

### Activity

```text
Create
Read
Update
Delete
```

### Book

```text
Create
Read
Update
Delete
```

### Book Quote

```text
Create
Read
Update
Delete
```

### Media

```text
Create
Read
Update
Delete
```

### Media Quote

```text
Create
Read
Update
Delete
```

Delete data besar seperti Material, Book, Movie harus menggunakan AlertDialog.

---

# 49. OPTIMISTIC UI

Untuk interaction ringan seperti:

- mood,
- todo checkbox,
- focus subtopic checkbox,
- task complete,

boleh gunakan optimistic UI agar terasa seperti native application.

Tetapi:

- database tetap source of truth,
- jika server gagal, rollback state,
- tampilkan error toast.

---

# 50. ACCESSIBILITY

Pastikan:

- keyboard navigation bekerja,
- focus ring terlihat,
- Dialog focus trap benar,
- button mempunyai accessible labels,
- icon-only button mempunyai `aria-label`,
- contrast cukup,
- warna bukan satu-satunya informasi jika informasi tersebut kritis.

Mood tetap mempunyai:

```text
emoji + aria-label
```

contoh:

```text
aria-label="Happy mood"
```

---

# 51. MOBILE UX

Target utama sekitar:

```text
360px
375px
390px
430px
```

Tidak boleh ada horizontal overflow pada layout utama.

Form pada mobile:

```text
1 column
```

Dialog panjang:

gunakan:

- Sheet,
atau
- Dialog dengan internal scroll.

Bottom navigation selalu dapat digunakan.

Textarea jangan terlalu kecil.

Cards tidak boleh memiliki padding berlebihan.

---

# 52. DESKTOP UX

Gunakan breakpoint responsive secara wajar.

Desktop dashboard:

```text
2x2 widget
```

Collection books/movie:

grid responsive.

Focus:

multi-column jika ruang cukup.

Tracker table boleh menggunakan width penuh.

Gunakan max-width agar content tidak terlalu melebar.

---

# 53. PERFORMANCE

Hindari:

- request database berulang yang tidak perlu,
- N+1 queries,
- fetching data dari client jika bisa server render,
- huge client bundles.

Gunakan:

- Server Components,
- parallel queries jika aman,
- aggregation SQL/ORM jika cocok,
- `revalidatePath` / equivalent setelah mutation.

Jangan memanggil API internal dari Server Component hanya untuk mengambil data yang bisa langsung di-query.

---

# 54. SECURITY

Walaupun personal app, tetap terapkan security dasar.

WAJIB:

- auth pada setiap mutation,
- credentials hanya server-side,
- session check server-side,
- Zod server validation,
- ORM parameterization,
- upload MIME validation,
- upload size validation,
- no arbitrary filesystem path,
- no secret leaking,
- no client-side DATABASE_URL.

Protect upload route.

Jangan menganggap URL tersembunyi sebagai security.

---

# 55. CODE QUALITY

Gunakan:

- TypeScript strict,
- descriptive naming,
- reusable server utilities,
- reusable components jika benar-benar reusable,
- server/client boundaries jelas.

Hindari:

```text
any
```

sebisa mungkin.

Jangan membuat satu file 1000+ lines jika dapat dipecah secara logis.

Tetapi juga jangan over-engineer dengan puluhan abstraction tidak berguna.

---

# 56. SUGGESTED PROJECT STRUCTURE

Sesuaikan dengan existing repository, tetapi struktur konseptual dapat seperti:

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── daily/
│   │   │   ├── page.tsx
│   │   │   └── calendar/
│   │   │       └── page.tsx
│   │   │
│   │   ├── focus/
│   │   │   └── page.tsx
│   │   │
│   │   ├── tracker/
│   │   │   └── page.tsx
│   │   │
│   │   └── library/
│   │       ├── page.tsx
│   │       ├── books/
│   │       │   └── page.tsx
│   │       └── movies/
│   │           └── page.tsx
│   │
│   └── api/
│
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── daily/
│   ├── focus/
│   ├── tracker/
│   ├── library/
│   └── ui/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validations/
│   ├── date/
│   ├── utils/
│   └── env.ts
│
└── actions/
```

Jangan memaksa struktur ini jika project existing sudah mempunyai pattern yang konsisten.

---

# 57. STAGE IMPLEMENTATION

Kerjakan secara bertahap.

JANGAN mengerjakan semuanya secara acak sekaligus.

---

## STAGE 1 — PROJECT AUDIT & FOUNDATION

Kerjakan:

- inspect repository,
- inspect package.json,
- inspect current UI,
- identify missing dependencies,
- install dependency yang memang diperlukan,
- configure `.env`,
- environment validation,
- database connection,
- schema design,
- migrations,
- timezone utilities.

Pastikan project masih dapat berjalan.

Commit:

```text
feat: setup application foundation and database
```

---

## STAGE 2 — AUTHENTICATION

Implement:

- Credentials login,
- env username/password,
- JWT,
- route protection,
- login UI,
- logout,
- session utilities.

Test:

```text
valid credentials
invalid credentials
unauthenticated access
authenticated access
logout
```

Commit:

```text
feat: implement personal authentication
```

---

## STAGE 3 — RESPONSIVE APPLICATION SHELL

Implement:

- mobile bottom nav,
- desktop sidebar,
- responsive main layout,
- global toaster,
- page headers,
- loading state conventions.

Navigation:

```text
Home
Daily
Focus
Tracker
Library
```

Commit:

```text
feat: build responsive application shell
```

---

## STAGE 4 — DAILY MODULE

Implement lengkap:

- mood,
- todo,
- inline editing,
- checkbox,
- delete,
- completion count,
- journal,
- date,
- calendar,
- calendar mood colors,
- todo statistics,
- historical journal dialog.

Pastikan timezone benar.

Commit:

```text
feat: implement daily log and calendar
```

---

## STAGE 5 — FOCUS MODULE

Implement:

- materials,
- progress,
- material detail,
- subtopics,
- subtopic progress,
- tasks,
- deadlines,
- complete/uncomplete,
- delete/edit.

Commit:

```text
feat: implement focus and task tracking
```

---

## STAGE 6 — ACTIVITY TRACKER

Implement:

- status,
- activity form,
- activity table,
- edit/delete,
- status row colors,
- Recharts,
- weekly summary,
- aggregation.

Commit:

```text
feat: implement activity tracking dashboard
```

---

## STAGE 7 — BOOK LIBRARY

Implement:

- books grid,
- add cover,
- upload,
- CRUD,
- quotes,
- reading progress,
- progress history,
- completion,
- rating,
- thoughts,
- reading analysis,
- chart jika data memadai.

Commit:

```text
feat: implement book library and reading analytics
```

---

## STAGE 8 — MOVIE & SERIES LIBRARY

Implement:

- movie/series collection,
- conditional fields,
- cover upload,
- documentation upload,
- quotes,
- progress,
- episode progress history,
- completed state,
- rating,
- thoughts,
- analysis.

Commit:

```text
feat: implement movie and series tracking
```

---

## STAGE 9 — DASHBOARD INTEGRATION

Sekarang hubungkan seluruh module dengan Home.

Dashboard:

- greeting,
- Daily widget,
- Focus widget,
- Tracker widget,
- Library widget.

Data WAJIB berasal dari database/module asli.

Commit:

```text
feat: integrate personal dashboard widgets
```

---

## STAGE 10 — POLISH

Review seluruh aplikasi khususnya pada:

```text
360px
390px
768px
1024px
1440px
```

Perbaiki:

- spacing,
- overflow,
- scroll areas,
- dialogs,
- typography,
- bottom navigation,
- states,
- Sonner,
- skeleton,
- accessibility,
- empty states,
- hover,
- touch interaction,
- duplicate layout,
- loading.

Commit:

```text
refactor: polish responsive ui and interactions
```

---

# 58. FINAL QUALITY CHECK

Setelah seluruh feature selesai, jalankan minimal:

```bash
npm run lint
```

atau command equivalent sesuai package manager.

Kemudian:

```bash
npx tsc --noEmit
```

jika project tidak memiliki script typecheck.

Kemudian:

```bash
npm run build
```

Gunakan command equivalent sesuai package manager.

Semua WAJIB lolos.

Jangan mengatakan project selesai jika production build gagal.

Fix semua:

- TypeScript error,
- ESLint error penting,
- broken imports,
- invalid routes,
- hydration errors,
- database type mismatch,
- React key warning,
- invalid server/client boundary.

Commit terakhir jika ada fix:

```text
fix: resolve production readiness issues
```

---

# 59. ACCEPTANCE CRITERIA

Project dianggap selesai hanya jika skenario ini berhasil.

## Authentication

- [ ] Login menggunakan username/password `.env`.
- [ ] Invalid login ditolak.
- [ ] User anonymous tidak dapat membuka dashboard.
- [ ] Logout bekerja.

## Daily

- [ ] Mood default Flat.
- [ ] Mood dapat diganti.
- [ ] Mood tersimpan per tanggal.
- [ ] Todo dapat ditambah.
- [ ] Todo dapat diedit.
- [ ] Todo dapat dicentang.
- [ ] Todo dapat dihapus.
- [ ] Complete counter benar.
- [ ] Journal tersimpan.
- [ ] Calendar mengambil historical data.
- [ ] Calendar color sesuai mood.
- [ ] Calendar menunjukkan X/Y todos.
- [ ] Klik tanggal membuka journal.

## Focus

- [ ] Material CRUD.
- [ ] Subtopic CRUD.
- [ ] Subtopic checkbox update progress.
- [ ] Task CRUD.
- [ ] Task mempunyai deadline.
- [ ] Dashboard mengurutkan task berdasarkan deadline.
- [ ] Task dapat selesai langsung dari dashboard.

## Tracker

- [ ] Activity dapat ditambahkan.
- [ ] Multiple activities satu tanggal didukung.
- [ ] Status tersimpan.
- [ ] Row background mengikuti status.
- [ ] Chart update.
- [ ] Weekly summary update.
- [ ] Activity dapat diedit/dihapus.

## Books

- [ ] Book CRUD.
- [ ] Cover tersimpan persisten.
- [ ] Reading progress tersimpan.
- [ ] Progress event tercatat.
- [ ] Pages/day dapat dihitung.
- [ ] Quotes CRUD.
- [ ] Completed book memiliki rating.
- [ ] Completed book memiliki thoughts.
- [ ] Reading duration benar.

## Movie / Series

- [ ] Media CRUD.
- [ ] Category conditional form.
- [ ] Movie progress 100%.
- [ ] Series progress berdasarkan episodes.
- [ ] Cover persisten.
- [ ] Documentation image optional.
- [ ] Quotes CRUD.
- [ ] Completed media memiliki rating.
- [ ] Thoughts tersimpan.
- [ ] Watch duration dihitung.

## Dashboard

- [ ] Semua widget berasal dari database.
- [ ] Semua widget clickable.
- [ ] Dashboard responsive.
- [ ] Widget tidak duplicate state.
- [ ] Update module langsung tercermin di Home.

## Mobile

- [ ] Bottom navigation nyaman.
- [ ] Tidak ada horizontal overflow.
- [ ] Dialog dapat digunakan pada layar kecil.
- [ ] Semua tombol mudah disentuh.
- [ ] Chart readable.
- [ ] Collection grid responsive.

## Production

- [ ] Lint pass.
- [ ] Typecheck pass.
- [ ] Production build pass.
- [ ] Tidak ada `.env` dalam commit.
- [ ] Tidak ada secrets dalam source code.
- [ ] Tidak melakukan `git push`.

---

# 60. HAL YANG JANGAN DILAKUKAN

JANGAN:

- membuat data dummy sebagai final implementation,
- menggunakan localStorage sebagai database utama,
- menyimpan image Base64 di PostgreSQL,
- menyimpan uploaded image ke local filesystem,
- menggunakan Vercel Blob; seluruh uploaded image disimpan sebagai binary `bytea` di Neon PostgreSQL,
- membuat authentication sendiri jika NextAuth sudah digunakan,
- menggunakan email login,
- membuat register page,
- menggunakan HTML validation sebagai satu-satunya validator,
- menggunakan toast selain Sonner,
- menggunakan chart library selain Recharts,
- membuat feature PWA tanpa diminta,
- menambahkan AI feature,
- menambahkan notification system,
- menambahkan social feature,
- membuat aplikasi multi-user,
- menambahkan role/admin system yang tidak dibutuhkan,
- over-engineer architecture,
- melakukan deployment,
- melakukan git push.

---

# 61. PRIORITAS IMPLEMENTASI

Jika harus memilih antara:

```text
visual cantik
vs
data benar
```

pilih:

```text
data benar
```

Jika harus memilih antara:

```text
animation kompleks
vs
UX sederhana tetapi cepat
```

pilih:

```text
UX sederhana tetapi cepat
```

Prioritas keseluruhan:

```text
1. Data correctness
2. Persistence
3. Authentication/security
4. Mobile usability
5. Functional completeness
6. Responsive behavior
7. UI consistency
8. Animation/polish
```

---

# 62. FINAL INSTRUCTION

Kerjakan project ini sebagai aplikasi yang benar-benar akan saya gunakan setiap hari, bukan sekadar demo portfolio.

Pastikan setiap keputusan mempertimbangkan:

- persistensi,
- penggunaan jangka panjang,
- mobile UX,
- data historical,
- maintainability,
- reliability.

Jangan berhenti hanya karena requirement tidak menjelaskan detail mikro. Pilih solusi engineering yang paling masuk akal dengan tetap mengikuti intent requirement ini.

Jika ada existing implementation yang sudah bagus:

**pertahankan dan integrasikan.**

Jangan rewrite tanpa kebutuhan.

Kerjakan stage secara berurutan.

Setiap stage:

```text
implement
-> verify
-> commit
-> lanjut stage berikutnya
```

JANGAN PUSH.

Setelah seluruh stage selesai, berikan final report singkat berisi:

1. fitur yang selesai,
2. dependency baru,
3. database tables yang dibuat,
4. migration yang dibuat,
5. environment variables yang perlu saya isi,
6. hasil lint,
7. hasil TypeScript check,
8. hasil production build,
9. daftar commit,
10. langkah yang perlu saya lakukan sendiri untuk Neon dan Vercel, termasuk menjalankan migration dan mengisi environment variables.

Jangan melakukan deployment sendiri.
