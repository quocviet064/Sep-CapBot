import { z } from "zod";

import { timestampFields, uuidSchema } from "./baseSchema";

export const topicBaseSchema = z.object({
  id: uuidSchema,
  supervisorId: uuidSchema,
  categoryId: uuidSchema,
  semesterId: uuidSchema,

  supervisorName: z
    .string()
    .nonempty({ message: "Supervisor must not be empty" }),
  categoryName: z.string().nonempty({ message: "Category must not be empty" }),
  semesterName: z.string().nonempty({ message: "Semester must not be empty" }),

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

  currentStatus: z.number(),
  currentVersionNumber: z.number(),

  ...timestampFields,
});

export const topicSchema = topicBaseSchema.pick({
  id: true,
  title: true,
  description: true,
  supervisorName: true,
  categoryName: true,
  semesterName: true,
  maxStudents: true,
  isApproved: true,
  isLegacy: true,
  currentStatus: true,
  currentVersionNumber: true,
  createdAt: true,
});

export type TopicType = z.infer<typeof topicSchema>;
