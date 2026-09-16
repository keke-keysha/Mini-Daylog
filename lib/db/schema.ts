import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  customType,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const moodEnum = pgEnum("mood", ["SAD", "FLAT", "HAPPY", "ANGRY"]);
export const mediaCategoryEnum = pgEnum("media_category", ["MOVIE", "SERIES"]);

export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  firstUsedDate: date("first_used_date", { mode: "string" }).notNull(),
  ...timestamps,
});

export const storedAssets = pgTable("stored_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyEntries = pgTable(
  "daily_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    mood: moodEnum("mood").default("FLAT").notNull(),
    journal: text("journal").default("").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("daily_entries_date_unique").on(table.date)],
);

export const dailyTodos = pgTable(
  "daily_todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dailyEntryId: uuid("daily_entry_id")
      .notNull()
      .references(() => dailyEntries.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [index("daily_todos_entry_idx").on(table.dailyEntryId, table.sortOrder)],
);

export const focusMaterials = pgTable("focus_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  ...timestamps,
});

export const focusSubtopics = pgTable(
  "focus_subtopics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    materialId: uuid("material_id")
      .notNull()
      .references(() => focusMaterials.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [index("focus_subtopics_material_idx").on(table.materialId, table.sortOrder)],
);

export const focusTasks = pgTable(
  "focus_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    materialId: uuid("material_id")
      .notNull()
      .references(() => focusMaterials.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    deadline: date("deadline", { mode: "string" }).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    ...timestamps,
  },
  (table) => [index("focus_tasks_deadline_idx").on(table.isCompleted, table.deadline)],
);

export const trackerDays = pgTable(
  "tracker_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    isFasting: boolean("is_fasting").default(false).notNull(),
    isSick: boolean("is_sick").default(false).notNull(),
    isRedDay: boolean("is_red_day").default(false).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("tracker_days_date_unique").on(table.date)],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackerDayId: uuid("tracker_day_id")
      .notNull()
      .references(() => trackerDays.id, { onDelete: "cascade" }),
    activity: text("activity").notNull(),
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }),
    durationMinutes: integer("duration_minutes").notNull(),
    paceSecondsPerKm: integer("pace_seconds_per_km"),
    ...timestamps,
  },
  (table) => [index("activity_logs_day_idx").on(table.trackerDayId)],
);

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    genre: text("genre").notNull(),
    ownership: text("ownership"),
    coverAssetId: uuid("cover_asset_id").references(() => storedAssets.id, { onDelete: "set null" }),
    totalPages: integer("total_pages").notNull(),
    currentPage: integer("current_page").default(0).notNull(),
    rating: integer("rating"),
    thoughts: text("thoughts").default("").notNull(),
    startedAt: date("started_at", { mode: "string" }).notNull(),
    completedAt: date("completed_at", { mode: "string" }),
    ...timestamps,
  },
  (table) => [index("books_updated_idx").on(table.updatedAt)],
);

export const bookQuotes = pgTable(
  "book_quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    quote: text("quote").notNull(),
    ...timestamps,
  },
  (table) => [index("book_quotes_book_idx").on(table.bookId)],
);

export const bookProgressLogs = pgTable(
  "book_progress_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    previousPage: integer("previous_page").notNull(),
    newPage: integer("new_page").notNull(),
    pagesDelta: integer("pages_delta").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("book_progress_book_date_idx").on(table.bookId, table.date)],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    genre: text("genre").notNull(),
    category: mediaCategoryEnum("category").notNull(),
    country: text("country").notNull(),
    recommendedBy: text("recommended_by"),
    coverAssetId: uuid("cover_asset_id").references(() => storedAssets.id, { onDelete: "set null" }),
    documentationAssetId: uuid("documentation_asset_id").references(() => storedAssets.id, {
      onDelete: "set null",
    }),
    totalEpisodes: integer("total_episodes"),
    watchedEpisodes: integer("watched_episodes"),
    rating: integer("rating"),
    thoughts: text("thoughts").default("").notNull(),
    startedAt: date("started_at", { mode: "string" }).notNull(),
    completedAt: date("completed_at", { mode: "string" }),
    ...timestamps,
  },
  (table) => [index("media_updated_idx").on(table.updatedAt)],
);

export const mediaQuotes = pgTable(
  "media_quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    quote: text("quote").notNull(),
    ...timestamps,
  },
  (table) => [index("media_quotes_media_idx").on(table.mediaId)],
);

export const mediaProgressLogs = pgTable(
  "media_progress_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    previousEpisodes: integer("previous_episodes").notNull(),
    newEpisodes: integer("new_episodes").notNull(),
    episodeDelta: integer("episode_delta").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("media_progress_media_date_idx").on(table.mediaId, table.date)],
);
