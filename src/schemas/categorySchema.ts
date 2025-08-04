import { z } from "zod";

import { createdFields } from "./baseSchema";

export const categoryBaseSchema = z.object({
  id: z.number(),

  name: z.string().nonempty({ message: "Supervisor must not be empty" }),
  description: z
    .string()
    .nonempty({ message: "Description must not be empty" }),
  topicsCount: z.number(),

  lastModifiedAt: z.string(),
  lastModifiedBy: z.string(),

  ...createdFields,
});

export const categorySchema = categoryBaseSchema.pick({
  id: true,
  name: true,
  description: true,
  topicsCount: true,
  createdAt: true,
});

export type CategoryType = z.infer<typeof categorySchema>;
export type CategoryDetailType = z.infer<typeof categoryBaseSchema>;
