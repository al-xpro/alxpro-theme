"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TITLE = 120;

export enum Status {
  Draft = "draft",
  Published = "published",
}

const PostSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE),
  slug: z.string().regex(SLUG, "Use lowercase letters, numbers and dashes"),
  tags: z.array(z.string()).default([]),
});

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fields?: Record<string, string[]> };

/**
 * Creates a post from a form submission.
 * @param formData - the submitted form
 * @returns the new post's id, or why it failed
 */
export async function createPost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { ok: false, error: "Not signed in" };

  const parsed = PostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Invalid post", fields: parsed.error.flatten().fieldErrors };
  }

  try {
    const { id } = await db.post.create({
      data: { ...parsed.data, status: Status.Draft, createdAt: new Date() },
    });
    revalidatePath(`/blog/${parsed.data.slug}`);
    return { ok: true, data: { id } };
  } catch (error: unknown) {
    console.error("createPost failed:\n", error instanceof Error ? error.message : error);
    return { ok: false, error: "Something went wrong" };
  }
}
