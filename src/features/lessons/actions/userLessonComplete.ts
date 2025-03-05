"use server"

import { getCurrentUser } from "@/services/clerk"
import { canUpdateUserLessonCompleteStatus } from "../permissions/userLessonComplete";
import { updateLessonCompleteStatusDb } from "../db/userLessonComplete";




export async function updateLessonCompleteStatus(lessonId: string, complete: boolean) {


  const { userId } = await getCurrentUser();

  const hasPermission = await canUpdateUserLessonCompleteStatus({ userId }, lessonId);

  if (userId == null || !hasPermission) {
    return { error: true, message: "Error updating your lesson completion status" }
  }

  await updateLessonCompleteStatusDb({ lessonId, userId, complete })

  return {
    error: false, message: "Successfully updated lesson completion status"
  }

}