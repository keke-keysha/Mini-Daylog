import { z } from "zod";

const optionalRating = z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().int().min(1).max(5).nullable());
const optionalEpisode = z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().int().min(0).nullable());

export const mediaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  genre: z.string().trim().min(1, "Genre is required").max(120),
  category: z.enum(["MOVIE", "SERIES"]),
  country: z.string().trim().min(1, "Country is required").max(120),
  recommendedBy: z.string().trim().max(180).transform((value) => value || null),
  totalEpisodes: optionalEpisode,
  watchedEpisodes: optionalEpisode,
  rating: optionalRating,
  thoughts: z.string().max(20_000),
}).superRefine((value, context) => {
  if (value.category === "MOVIE") {
    value.totalEpisodes = null;
    value.watchedEpisodes = null;
    return;
  }
  if (!value.totalEpisodes || value.totalEpisodes <= 0) context.addIssue({ code: "custom", message: "Total episodes must be greater than zero", path: ["totalEpisodes"] });
  if (value.watchedEpisodes == null) context.addIssue({ code: "custom", message: "Watched episodes is required", path: ["watchedEpisodes"] });
  if (value.totalEpisodes != null && value.watchedEpisodes != null && value.watchedEpisodes > value.totalEpisodes) context.addIssue({ code: "custom", message: "Watched episodes cannot exceed total episodes", path: ["watchedEpisodes"] });
});
