'use server'
import { getCurrentUser } from "@/services/clerk"
import { canRefundPurchases } from "../permissions/refund-product.permission"
import { stripeServerClient } from "@/services/stripe/stripeServer"
import { db } from "@/drizzle/db"
import { updatePurchase } from "../db/purchases"
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAccess"

export async function refundPurchase(id: string) {

    if (!canRefundPurchases(await getCurrentUser())) {
        return { error: true, message: "You do not have permission to refund this purchase" }
    }


    const data = await db.transaction(async trx => {
        const refundedPuchase = await updatePurchase(id, { refundedAt: new Date() }, trx)
        const session = await stripeServerClient.checkout.sessions.retrieve(refundedPuchase.stripeSessionId)

        if (session.payment_intent == null) {
            trx.rollback()
            return { error: true, message: "Failed to refund purchase" }
        }

        try {
            await stripeServerClient.refunds.create({
                payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id,
            })
            await revokeUserCourseAccess(refundedPuchase, trx)
        } catch {
            trx.rollback()
            return { error: true, message: "Failed to refund purchase" }
        }

    })

    return data ?? { error: false, message: "Purchase refunded" }
}