import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { UserData } from '@/types/dataTypes'
import { deleteUserFromDb, insertUserToDb } from '@/server/db'
import { generateRandomMotto } from '@/helpers/generateRandomMotto'

export async function POST(req: NextRequest) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  let evt

  try {
    evt = await verifyWebhook(req, { signingSecret: WEBHOOK_SECRET })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, image_url, updated_at } = evt.data

    if (!id) {
      return new Response('Error occured -- missing data', {
        status: 400
      })
    }

    try {
      const user: UserData = {
        userId: id,
        username: `User-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date(),
        motto: generateRandomMotto()
      }

      // Insert a new user record into the database.
      await insertUserToDb(user)

    } catch (error) {
      console.log(error)
      return new Response('Failed to insert user to database', {
        status: 500
      })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      return new Response("User doesn't exist", {
        status: 400
      })
    }

    try {
      await deleteUserFromDb(id)
    } catch (error) {
      console.log(error)
      return new Response('Failed to delete user from database', {
        status: 500
      })
    }
  }

  return new Response('', { status: 200 })
}
