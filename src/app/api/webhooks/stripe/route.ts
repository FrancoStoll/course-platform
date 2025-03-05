import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { ProductTable, UserTable } from "@/drizzle/schema";
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess";
import { insertPurchase } from "@/features/purchases/db/purchases";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";


export async function GET(request: NextRequest) {
    const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId")

    if (stripeSessionId == null) redirect("/products/purchase-failure")

    let redirectUrl: string

    try {
        const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, { expand: ["line_items"] })

        const productId = await processStripeCheckout(checkoutSession)


        redirectUrl = `/products/${productId}/purchase/success`

    } catch (error) {
        console.log(error)

        redirectUrl = `/products/purchase-failure`
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url))
}



export async function POST(request: NextRequest) {

    const event = await stripeServerClient.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") as string, env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
            try {
                await processStripeCheckout(event.data.object)
            } catch {
                return new Response(null, { status: 500 })
            }
        }
    }
    return new Response(null, { status: 200 })
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {

    const userID = checkoutSession.metadata?.userId
    const productId = checkoutSession.metadata?.productId

    if (userID == null || productId == null) throw new Error("Missing metadata")

    const [product, user] = await Promise.all([
        getProduct(productId),
        await getUser(userID)
    ])

    if (product == null || user == null) throw new Error("Failed to get product or user")

    const coursesIds = product.courseProducts.map(c => c.courseId)
    db.transaction(async trx => {
        try {
            addUserCourseAccess({ userId: user.id, coursesId: coursesIds }, trx)
            insertPurchase({
                stripeSessionId: checkoutSession.id,
                pricePaidInCents: checkoutSession.amount_total || product.priceInDollars * 100,
                productDetails: product,
                userId: user.id,
                productId: product.id
            }, trx)
        } catch (error) {
            trx.rollback()
            throw error
        }


    })

    return productId
}


async function getProduct(productId: string) {

    return db.query.ProductTable.findFirst({
        where: eq(ProductTable.id, productId),
        columns: {
            id: true,
            priceInDollars: true,
            name: true,
            description: true,
            imageUrl: true,
        },
        with: {
            courseProducts: { columns: { courseId: true } }
        }
    })

}

async function getUser(userId: string) {
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId),
        columns: { id: true }
    })
}