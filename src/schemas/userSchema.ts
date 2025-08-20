// src/schemas/userSchema.ts
import { z } from "zod";
import { auditFields, uuidSchema } from "./baseSchema";

export const roles = [
  "Administrator",
  "Moderator",
  "Supervisor",
  "Reviewer",
] as const;
export type Role = (typeof roles)[number];

export const userBaseSchema = z.object({
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

  emailOrUsername: z
    .string()
    .nonempty({ message: "Email or Username must not be empty" }),

  avatarUrl: z.string().optional(),

  // ⬇️ dùng enum cho chắc
  role: z.enum(roles, { required_error: "Role is required" }),

  status: z.boolean(),

  ...auditFields,
});

export const createUserSchema = userBaseSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  status: true,
});

export const userInfoSchema = userBaseSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
});

// ⬇️ thêm role vào login
export const loginUserSchema = userBaseSchema.pick({
  emailOrUsername: true,
  password: true,
  role: true,
});

export const registerSchema = userBaseSchema.pick({
  fullName: true,
  phoneNumber: true,
  email: true,
  password: true,
});

export const userProductSchema = z.object({
  name: userBaseSchema.shape.fullName,
  avatar: userBaseSchema.shape.avatarUrl,
});

export type UserType = z.infer<typeof userBaseSchema>;
export type CreateUserType = z.infer<typeof createUserSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
