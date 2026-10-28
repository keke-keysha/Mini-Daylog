import { z } from "zod";

import { thoughtContentSchema } from "@/lib/thoughts/content";

export const thoughtSchema = z.object({
  title: z.string().trim().min(1, "Give your thought a title").max(200, "Title must not exceed 200 characters"),
  content: thoughtContentSchema,
});
