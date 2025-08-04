import { z } from "zod";

export const uuidSchema = z.string().uuid({ message: "ID không hợp lệ" });

export const timestampFields = {
  createdAt: z.string(),
};

export const createdFields = {
  createdAt: z.string(),
  createdBy: z.string(),
};

export const auditFields = {
  ...timestampFields,
  createdBy: z.string(),
  updatedBy: z.string(),
};
