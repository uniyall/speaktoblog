import { z } from "zod";

export const CreatePostInput = z.object({
  content: z.string(),
  title: z.string(),
});

export const UpdatePostInput = z.object({
  content: z.string(),
  title: z.string(),
});

export type CreatePostInputType = z.infer<typeof CreatePostInput>;

export type UpdatePostInputType = z.infer<typeof UpdatePostInput>;
