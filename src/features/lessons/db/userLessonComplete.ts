import { db } from "@/drizzle/db"
import { UserLessonCompleteTable } from "@/drizzle/schema"
import { eq, and } from 'drizzle-orm';
import { revalidateUserLessonCompleteCache } from "./cache/userLessonComplete.cache";

export async function updateLessonCompleteStatusDb({
  lessonId,
  userId,
  complete,
}: {
  lessonId: string
  userId: string
  complete: boolean
}) {
  let completion: { lessonId: string, userId: string } | undefined
  if (complete) {
    const [c] = await db.insert(UserLessonCompleteTable).values({ lessonId, userId }).onConflictDoNothing().returning()
    completion = c

  } else {

    const [d] = await db.delete(UserLessonCompleteTable).where(and(eq(UserLessonCompleteTable.lessonId, lessonId), eq(UserLessonCompleteTable.userId, userId))).returning();
    completion = d
  }

  if (completion == null) return

  revalidateUserLessonCompleteCache({
    lessonId: completion.lessonId, userId: completion.userId
  })

  return completion
}