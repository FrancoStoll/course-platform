'use server'

import { z } from "zod";
import { courseSchema } from "../schemas/courses.schema";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/clerk";
import { canCreateCourse, canDeleteCourse, canUpdateCourses } from "../permissions/courses.permissions";
import { deleteCourseDb, insertCourse, updateCourseDb } from "../db/courses.db";



export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {


    const { success, data } = courseSchema.safeParse(unsafeData)

    if (!success || !canCreateCourse(await getCurrentUser())) {
        return { error: true, message: "There was an error creating your course" }
    }

    const course = await insertCourse(data)

    redirect(`/admin/courses/${course.id}/edit`)

}

export async function updateCourse(courseId: string, unsafeData: z.infer<typeof courseSchema>) {


    const { success, data } = courseSchema.safeParse(unsafeData)

    if (!success || !canUpdateCourses(await getCurrentUser())) {
        return { error: true, message: "There was an error updating your course" }
    }

     await updateCourseDb(courseId, data)

    return { error: false, message: "Successfully updated course" }

}



export async function deleteCourse(courseId: string) {




    if (!canDeleteCourse(await getCurrentUser())) {
        return { error: true, message: "There was an error deleting your course" }
    }

    await deleteCourseDb(courseId)

    return {
        error: false,
        message: "Course deleted"
    }

}