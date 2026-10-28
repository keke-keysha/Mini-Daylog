# DayLog update V2

## Changes

| Stage | Files | Behavior |
| --- | --- | --- |
| Daily check-in | `app/(dashboard)/daily/page.tsx`, `app/(dashboard)/tracker/page.tsx`, `actions/tracker.ts`, `lib/data/daily.ts`, `lib/data/tracker.ts`, `components/daily/daily-calendar.tsx` | Reuses the existing status form and tracker rows on Daily. Calendar merges status-only dates and shows adjacent accessible green/mustard/red indicators. |
| Activity | `components/layout/app-navigation.tsx`, dashboard and Activity pages, `components/tracker/activity-chart.tsx` | Visible Activity labels retain `/tracker`. Only pace reverses the Y axis; values remain seconds/km with formatted ticks/tooltips. |
| Historical moods | Calendar page/component and `components/daily/mood-picker.tsx` | Reuses the mood action in the day dialog, refreshes the calendar after success, and rolls back failed edits. Journal/todos remain separate. |
| Thoughts backend | `actions/thoughts.ts`, `lib/data/thoughts.ts`, `lib/validations/thought.ts`, `lib/thoughts/*`, `lib/db/schema.ts`, `drizzle/*` | Authenticated persistent CRUD and existing asset uploads. Structured JSON allows only supported content, safe links, and authenticated asset paths. Embedded assets remain intact when notes are deleted. |
| Thoughts UI | `app/(dashboard)/thoughts/*`, `components/thoughts/thought-editor.tsx`, navigation, global styles, package files | Sorted collection with dates, excerpts and first-image thumbnails; full-page editor with explicit saves, essential formatting, image insertion and confirmed deletion. Mobile More contains Library and Thoughts; desktop shows all six destinations. |
| Polish | Calendar component, content regression tests and this document | Constrains narrow calendar cells to their grid columns and verifies ProseMirror attribute normalization. |

Added runtime dependencies: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, and `@tiptap/extension-highlight`, all at `^3.32.0`. No storage service or environment variables were added.

Unsaved changes prompt before following links or reloading/closing the page. Browser back/forward navigation is not intercepted. Notes save only through Save/Update; an uploaded image becomes part of the saved note when the note is saved. Orphan asset cleanup is intentionally omitted.

## Apply the migration to Neon

The update does not apply migrations to your existing database. `drizzle/0001_thoughts.sql` creates only `thoughts` and `thoughts_updated_idx`. The original foundation SQL is unchanged. Baseline and new Drizzle snapshots are included so future generation can compare schemas correctly.

1. Back up the target database or test on a Neon branch first.
2. Review `drizzle/0001_thoughts.sql`. Confirm the target database already records `0000_daylog_foundation` in the existing Drizzle migration history. If the foundation was applied manually without its migration history, reconcile that history before running the migrator; do not reset existing tables.
3. Set `DATABASE_URL` to the intended database and use the existing migration script:

   ```sh
   npm run db:migrate
   ```

   Drizzle config reads the process environment. On Node 22+, load the local `.env` without printing its values with:

   ```sh
   node --env-file=.env --run db:migrate
   ```

4. Check that Thoughts loads, create a temporary note with an uploaded image, save it, reload, log out/in, edit and delete it. Recheck your existing Daily, Focus, Activity and Library records.

Do not run schema reset or destructive sync commands. No deployment or push is part of this update.

## Validation

- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- Six content tests cover safe URL schemes, authenticated image paths, formatting round trips, attribute sanitization/normalization, unsupported nodes, byte limits, and empty/text-only previews. Run with `npx --yes tsx --test lib/thoughts/content.test.ts`.
- Disposable PGlite integration checks apply both migrations, compare all pre-existing tables/rows before and after the additive migration, and exercise Thoughts CRUD, updated ordering/timestamps, not-found cases, persistence after database restart, authenticated image reads/uploads, MIME/signature/size failures, and asset retention after note deletion. They also exercise status-only calendar days, independent status flags, and historical mood edits preserving journals and todos. These checks substitute a test session and the local database adapter; they do not connect to Neon.
- Chromium checks run an isolated application copy with real NextAuth login/logout and a disposable local database. They exercise full-page note creation/update/deletion, formatting, link editing, secure images after reload/login, thumbnails, unsaved-link cancellation, mobile More navigation, calendar status dots/historical moods, rollback on a failed mood request, and non-overlapping cells at 360px. Pace was checked to place 04:30 above 07:00, while distance and duration retained normal ordering. Layout overflow checks passed at 360, 390, 430 and 1280px, with light/dark visual checks. Local test tools and databases live outside the repository; no test credentials enter committed files.
- Existing Neon data, Neon migration execution, and production-host behavior require manual verification after applying the migration. No existing Neon records were mutated during validation.
