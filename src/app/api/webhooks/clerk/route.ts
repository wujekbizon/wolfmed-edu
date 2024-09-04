import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { UserData } from '@/types/dataTypes'
import { deleteUserFromDb, insertUserToDb } from '@/server/db'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, image_url, updated_at } = evt.data

    if (!id) {
      return new Response('Error occured -- missing data', {
        status: 400,
      })
    }

    try {
      const user: UserData = {
        userId: id,
        imageUrl: image_url || '',
        updatedAt: new Date(updated_at),
      }

      // Insert a new user record into the database.
      await insertUserToDb(user)
    } catch (error) {
      console.log(error)
      return new Response('Failed to insert user to database', {
        status: 500,
      })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      return new Response("User doesn't exist", {
        status: 400,
      })
    }

    // Deletes a user record from the database based on the provided ID,
    // all user progress and completed tests.
    // NOTE: Tests created by this user are currently not deleted.
    await deleteUserFromDb(id)
  }

  return new Response('', { status: 200 })
}
