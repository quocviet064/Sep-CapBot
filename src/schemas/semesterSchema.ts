import { z } from "zod";

export const semesterBaseSchema = z.object({
  id: z.number(),

  name: z.string().nonempty({ message: "Semester must not be empty" }),
});

export type SemesterType = z.infer<typeof semesterBaseSchema>;
