import { z } from "zod";

import { auditFields, uuidSchema } from "./baseSchema";

export const roles = ["Member", "Subscription Member", "Consultant", "Admin"];

export const userSchema = z.object({
  userId: uuidSchema,

  fullName: z
    .string()
    .nonempty({ message: "Full name must not be empty" })
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(255, { message: "Full name must not exceed 255 characters" })
    .regex(/^[\p{L} ]+$/u, {
      message: "Full name may only contain letters and spaces",
    }),

  email: z.string().email({ message: "Invalid email address" }),

  phoneNumber: z.string().regex(/^(0\d{9}|(\+84)\d{9})$/, {
    message: "Invalid phone number",
  }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(128, { message: "Password must not exceed 128 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, {
      message: "Password must contain at least one special character",
    }),

  avatarUrl: z.string().optional(),

  role: z.string().refine((val) => roles.includes(val), {
    message: `Invalid role. Accepted roles are: ${roles.join(", ")}`,
  }),

  status: z.boolean(),

  ...auditFields,
});

export const createUserSchema = userSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  status: true,
});

export const userInfoSchema = userSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
});

export const loginUserSchema = userSchema.pick({
  email: true,
  password: true,
});

export const registerSchema = userSchema.pick({
  fullName: true,
  phoneNumber: true,
  email: true,
  password: true,
});

export const userProductSchema = z.object({
  name: userSchema.shape.fullName,
  avatar: userSchema.shape.avatarUrl,
});

export type UserType = z.infer<typeof userSchema>;
export type CreateUserType = z.infer<typeof createUserSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
