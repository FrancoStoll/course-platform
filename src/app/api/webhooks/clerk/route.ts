import { env } from '@/data/env/server'
import { deleteUser, insertUser, updateUser } from '@/features/users/db/users'
import { syncClerkUserMetadata } from '@/services/clerk'
import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'


async function validateRequest(request: Request) {
    const payloadString = await request.text()
    const headerPayload = await headers()

    const svixHeaders = {
        'svix-id': headerPayload.get('svix-id')!,
        'svix-timestamp': headerPayload.get('svix-timestamp')!,
        'svix-signature': headerPayload.get('svix-signature')!,
    }
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
    return wh.verify(payloadString, svixHeaders) as WebhookEvent
}

export async function POST(request: Request) {
    const payload = await validateRequest(request)


    switch (payload.type) {

        case "user.created":
        case "user.updated": {

            const email = payload.data.email_addresses.find(email => email.id === payload.data.primary_email_address_id)?.email_address
            const name = `${payload.data.first_name} ${payload.data.last_name}`.trim()

            if (email == null) return new Response('Email not found', { status: 400 })
            if (name === "") return new Response('Name not found', { status: 400 })

            if (payload.type === 'user.created') {
                const user = await insertUser({
                    clerkUserId: payload.data.id,
                    email,
                    name,
                    imageUrl: payload.data.image_url,
                    role: "user"
                })

                await syncClerkUserMetadata(user)
            } else {
                await updateUser({ clerkUserId: payload.data.id }, {

                    email,
                    name,
                    imageUrl: payload.data.image_url,
                    role: payload.data.public_metadata.role
                })


            }
            break;
        }

        case "user.deleted": {
            if (payload.data.id != null) {
                await deleteUser({ clerkUserId: payload.data.id })
            }
            break
        }


        default:
            break;
    }

    return Response.json("", { status: 200 })
}