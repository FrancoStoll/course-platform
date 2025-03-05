import { db } from "@/drizzle/db";
import { ProductTable, PurchaseTable, UserCourseAccessTable } from "@/drizzle/schema";
import { revalidateUserCourseAccessCache } from "../cache/userCourseAccess";
import { eq, and, isNull, inArray } from 'drizzle-orm';


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

export async function revokeUserCourseAccess({ userId, productId }: { userId: string, productId: string }, trx: Omit<typeof db, "$client"> = db) {

    const validPurchases = await trx.query.PurchaseTable.findMany({
        where: and(eq(PurchaseTable.userId, userId), isNull(PurchaseTable.refundedAt)),
        with: {
            product: {
                with: {
                    courseProducts: { columns: { courseId: true } }
                }
            }
        }
    })

    const refundPurchase = await trx.query.ProductTable.findFirst({
        where: eq(ProductTable.id, productId),
        with: {
            courseProducts: { columns: { courseId: true } }
        }
    })

    if (refundPurchase == null) return

    const validCourseIds = validPurchases.flatMap(p => p.product.courseProducts.map(c => c.courseId))

    const removeCourseIds = refundPurchase.courseProducts.flatMap(c => c.courseId).filter(courseId => !validCourseIds.includes(courseId))

    const revokedAccess = await trx.delete(UserCourseAccessTable).where(and(eq(UserCourseAccessTable.userId, userId), inArray(UserCourseAccessTable.courseId, removeCourseIds))).returning()


    revokedAccess.forEach(revalidateUserCourseAccessCache)

    return revokedAccess
}