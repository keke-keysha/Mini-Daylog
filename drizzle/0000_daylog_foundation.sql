CREATE TYPE "mood" AS ENUM ('SAD', 'FLAT', 'HAPPY', 'ANGRY');
CREATE TYPE "media_category" AS ENUM ('MOVIE', 'SERIES');

CREATE TABLE "app_settings" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "first_used_date" date NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "app_settings_singleton" CHECK ("id" = 1)
);

CREATE TABLE "stored_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "original_name" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "stored_assets_size_check" CHECK ("size_bytes" > 0 AND "size_bytes" <= 1500000),
  CONSTRAINT "stored_assets_mime_check" CHECK ("mime_type" IN ('image/jpeg', 'image/png', 'image/webp'))
);

CREATE TABLE "daily_entries" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "date" date NOT NULL, "mood" mood DEFAULT 'FLAT' NOT NULL, "journal" text DEFAULT '' NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "daily_entries_date_unique" ON "daily_entries" ("date");
CREATE TABLE "daily_todos" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "daily_entry_id" uuid NOT NULL REFERENCES "daily_entries"("id") ON DELETE CASCADE, "text" text NOT NULL, "is_completed" boolean DEFAULT false NOT NULL, "sort_order" integer DEFAULT 0 NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "daily_todos_entry_idx" ON "daily_todos" ("daily_entry_id", "sort_order");

CREATE TABLE "focus_materials" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" text NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE TABLE "focus_subtopics" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "material_id" uuid NOT NULL REFERENCES "focus_materials"("id") ON DELETE CASCADE, "title" text NOT NULL, "is_completed" boolean DEFAULT false NOT NULL, "sort_order" integer DEFAULT 0 NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "focus_subtopics_material_idx" ON "focus_subtopics" ("material_id", "sort_order");
CREATE TABLE "focus_tasks" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "material_id" uuid NOT NULL REFERENCES "focus_materials"("id") ON DELETE CASCADE, "title" text NOT NULL, "deadline" date NOT NULL, "is_completed" boolean DEFAULT false NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "focus_tasks_deadline_idx" ON "focus_tasks" ("is_completed", "deadline");

CREATE TABLE "tracker_days" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "date" date NOT NULL, "is_fasting" boolean DEFAULT false NOT NULL, "is_sick" boolean DEFAULT false NOT NULL, "is_red_day" boolean DEFAULT false NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "tracker_days_date_unique" ON "tracker_days" ("date");
CREATE TABLE "activity_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "tracker_day_id" uuid NOT NULL REFERENCES "tracker_days"("id") ON DELETE CASCADE, "activity" text NOT NULL, "distance_km" numeric(8,2), "duration_minutes" integer NOT NULL, "pace_seconds_per_km" integer, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "activity_logs_day_idx" ON "activity_logs" ("tracker_day_id");

CREATE TABLE "books" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" text NOT NULL, "author" text NOT NULL, "genre" text NOT NULL, "ownership" text, "cover_asset_id" uuid REFERENCES "stored_assets"("id") ON DELETE SET NULL, "total_pages" integer NOT NULL, "current_page" integer DEFAULT 0 NOT NULL, "rating" integer, "thoughts" text DEFAULT '' NOT NULL, "started_at" date NOT NULL, "completed_at" date, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL, CONSTRAINT "books_pages_check" CHECK ("total_pages" > 0 AND "current_page" >= 0 AND "current_page" <= "total_pages"), CONSTRAINT "books_rating_check" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5));
CREATE INDEX "books_updated_idx" ON "books" ("updated_at");
CREATE TABLE "book_quotes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE, "quote" text NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "book_quotes_book_idx" ON "book_quotes" ("book_id");
CREATE TABLE "book_progress_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE, "date" date NOT NULL, "previous_page" integer NOT NULL, "new_page" integer NOT NULL, "pages_delta" integer NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "book_progress_book_date_idx" ON "book_progress_logs" ("book_id", "date");

CREATE TABLE "media" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" text NOT NULL, "genre" text NOT NULL, "category" media_category NOT NULL, "country" text NOT NULL, "recommended_by" text, "cover_asset_id" uuid REFERENCES "stored_assets"("id") ON DELETE SET NULL, "documentation_asset_id" uuid REFERENCES "stored_assets"("id") ON DELETE SET NULL, "total_episodes" integer, "watched_episodes" integer, "rating" integer, "thoughts" text DEFAULT '' NOT NULL, "started_at" date NOT NULL, "completed_at" date, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL, CONSTRAINT "media_episode_check" CHECK (("category" = 'MOVIE' AND "total_episodes" IS NULL AND "watched_episodes" IS NULL) OR ("category" = 'SERIES' AND "total_episodes" > 0 AND "watched_episodes" >= 0 AND "watched_episodes" <= "total_episodes")), CONSTRAINT "media_rating_check" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5));
CREATE INDEX "media_updated_idx" ON "media" ("updated_at");
CREATE TABLE "media_quotes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "media_id" uuid NOT NULL REFERENCES "media"("id") ON DELETE CASCADE, "quote" text NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "media_quotes_media_idx" ON "media_quotes" ("media_id");
CREATE TABLE "media_progress_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "media_id" uuid NOT NULL REFERENCES "media"("id") ON DELETE CASCADE, "date" date NOT NULL, "previous_episodes" integer NOT NULL, "new_episodes" integer NOT NULL, "episode_delta" integer NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "media_progress_media_date_idx" ON "media_progress_logs" ("media_id", "date");
