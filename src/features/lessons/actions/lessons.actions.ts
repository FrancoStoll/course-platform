"use server"

import { z } from "zod"

import { getCurrentUser } from "@/services/clerk"
import {
  canCreateLessons,
  canDeleteLessons,
  canUpdateLessons,
} from "../permissions/lesson.permissions"
import {
  getNextCourseLessonOrder,
  insertLesson,
  updateLesson as updateLessonDb,
  deleteLesson as deleteLessonDb,
  updateLessonOrders as updateLessonOrdersDb,
} from "../db/lesson.db"
import { lessonsSchema as lessonSchema } from "../schemas/lessons.schema"

export async function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafeData)

  if (!success || !canCreateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your lesson" }
  }

  const order = await getNextCourseLessonOrder(data.sectionId)

  await insertLesson({ ...data, order })

  return { error: false, message: "Successfully created your lesson" }
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>
) {
  const { success, data } = lessonSchema.safeParse(unsafeData)

  if (!success || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your lesson" }
  }

  await updateLessonDb(id, data)

  return { error: false, message: "Successfully updated your lesson" }
}

export async function deleteLesson(id: string) {
  if (!canDeleteLessons(await getCurrentUser())) {
    return { error: true, message: "Error deleting your lesson" }
  }

  await deleteLessonDb(id)

  return { error: false, message: "Successfully deleted your lesson" }
}

export async function updateLessonOrders(lessonIds: string[]) {
  if (lessonIds.length === 0 || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "Error reordering your lessons" }
  }

  await updateLessonOrdersDb(lessonIds)

  return { error: false, message: "Successfully reordered your lessons" }
}