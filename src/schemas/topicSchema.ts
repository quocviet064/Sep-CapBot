import { z } from "zod";

import { timestampFields, uuidSchema } from "./baseSchema";

export const topicSchema = z.object({
  id: uuidSchema,
  supervisorId: uuidSchema,
  categoryId: uuidSchema,
  semesterId: uuidSchema,

  supervisor: z.string().nonempty({ message: "Supervisor must not be empty" }),

  title: z.string().nonempty({ message: "Title must not be empty" }),
  description: z
    .string()
    .nonempty({ message: "Description must not be empty" }),
  objectives: z.string().nonempty({ message: "Objectives must not be empty" }),
  maxStudents: z
    .number()
    .min(1, { message: "Max students must be at least 1" }),

  isLegacy: z.boolean(),
  isApproved: z.boolean(),

  ...timestampFields,
});

export type TopicType = z.infer<typeof topicSchema>;
