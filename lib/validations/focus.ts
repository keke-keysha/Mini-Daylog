import { z } from "zod";

import { idSchema, logicalDateSchema } from "@/lib/validations/daily";

export { idSchema };
export const focusTitleSchema = z.string().trim().min(1, "Title is required").max(180, "Title is too long");
export const focusTaskSchema = z.object({ title: focusTitleSchema, deadline: logicalDateSchema });
