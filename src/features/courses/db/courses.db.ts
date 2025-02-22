import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";
import { revalidateCourseCache } from "../cache/courses.cache";
import { eq } from "drizzle-orm";



export async function insertCourse(data: typeof CourseTable.$inferInsert) {

    const [newCourse] = await db.insert(CourseTable).values(data).returning()


    if (newCourse == null) throw new Error("Failed to create course");

    revalidateCourseCache(newCourse.id)

    return newCourse
}


export async function updateCourseDb(courseId: string, data: typeof CourseTable.$inferInsert) {

    const [updatedCourse] = await db.update(CourseTable).set(data).where(eq(CourseTable.id, courseId)).returning()


    if (updatedCourse == null) throw new Error("Failed to updated course");

    revalidateCourseCache(updatedCourse.id)

    return updatedCourse
}


export async function deleteCourseDb(courseId: string) {



    const [deletingCourse] = await db.delete(CourseTable).where(eq(CourseTable.id, courseId)).returning()


    if (deletingCourse == null) throw new Error("Failed to delete course");

    revalidateCourseCache(deletingCourse.id)

    return deletingCourse
}