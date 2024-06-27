import { z } from "zod";

export const UserSignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const UserSigninInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type UserSignupInputType = z.infer<typeof UserSignupInput>
export type UserSigninInputType = z.infer<typeof UserSigninInput>

