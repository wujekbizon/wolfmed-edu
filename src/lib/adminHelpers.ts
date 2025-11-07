/**
 * Admin role checking utilities
 * Uses Clerk metadata to determine admin access
 */

import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Check if the current user is an admin
 * Looks for role === 'admin' in Clerk publicMetadata
 * @returns True if user is admin, false otherwise
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const user = await currentUser()
    if(!user) {
      return false
    }

    // Check if user has admin role in publicMetadata
    const role = user.publicMetadata?.role as string | undefined
    return role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get current user ID or throw error
 * @returns User ID
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated')
  }
  return userId
}

/**
 * Require admin role or redirect to blog page
 * Use this in page components
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    redirect('/blog')
  }
}

/**
 * Get current admin user info
 * @returns User ID and name, or null if not admin
 */
export async function getAdminUser(): Promise<{
  userId: string
  name: string
} | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await currentUser()
    if(!user) {
      return null
    }

    const role = user.publicMetadata?.role as string | undefined
    if (role !== 'admin') return null

    const name =
      user.firstName || user.username || user.emailAddresses[0]?.emailAddress || 'Admin'

    return {
      userId,
      name,
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * Check admin status and throw error if not admin
 * Use this in server actions
 */
export async function requireAdminAction(): Promise<{
  userId: string
  name: string
}> {
  const admin = await getAdminUser()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return admin
}
