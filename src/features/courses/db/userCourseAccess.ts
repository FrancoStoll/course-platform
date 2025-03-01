import { db } from "@/drizzle/db";
import { UserCourseAccessTable } from "@/drizzle/schema";
import { revalidateUserCourseAccessCache } from "../cache/userCourseAccess";

export async function addUserCourseAccess(
    {
        userId,
        coursesId,
    }: {
        userId: string;
        coursesId: string[];
    }, trx: Omit<typeof db, "$client"> = db
) {

    const accesses = await trx.insert(UserCourseAccessTable).values(coursesId.map(courseId => ({ userId, courseId }))).onConflictDoNothing().returning()


    accesses.forEach(revalidateUserCourseAccessCache)

    return accesses
}