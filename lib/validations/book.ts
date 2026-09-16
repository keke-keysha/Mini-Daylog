import { z } from "zod";

const optionalRating = z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().int().min(1).max(5).nullable());

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  author: z.string().trim().min(1, "Author is required").max(180),
  genre: z.string().trim().min(1, "Genre is required").max(120),
  ownership: z.string().trim().max(120).transform((value) => value || null),
  totalPages: z.coerce.number().int().positive("Total pages must be greater than zero").max(1_000_000),
  currentPage: z.coerce.number().int().min(0, "Current page cannot be negative"),
  rating: optionalRating,
  thoughts: z.string().max(20_000),
}).refine((value) => value.currentPage <= value.totalPages, { message: "Current page cannot exceed total pages", path: ["currentPage"] });

export const quoteSchema = z.string().trim().min(1, "Quote cannot be empty").max(5_000, "Quote is too long");
