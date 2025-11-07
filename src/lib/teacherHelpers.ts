/**
 * Teacher role checking utilities
 * Uses Clerk metadata to determine teacher access
 */

import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Check if the current user is a teacher
 * Looks for role === 'teacher' in Clerk publicMetadata
 * @returns True if user is teacher, false otherwise
 */
export async function isUserTeacher(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const user = await currentUser()
    if (!user) {
      return false
    }

    // Check if user has teacher role in publicMetadata
    const role = user.publicMetadata?.role as string | undefined
    return role === 'teacher' || role === 'admin' // Admins can also access teacher features
  } catch (error) {
    console.error('Error checking teacher status:', error)
    return false
  }
}

/**
 * Require teacher role or redirect to home page
 * Use this in page components
 */
export async function requireTeacher(): Promise<void> {
  const isTeacher = await isUserTeacher()
  if (!isTeacher) {
    redirect('/')
  }
}

/**
 * Get current teacher user info
 * @returns User ID, name, and role, or null if not teacher
 */
export async function getTeacherUser(): Promise<{
  userId: string
  name: string
  role: 'teacher' | 'admin'
} | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await currentUser()
    if (!user) {
      return null
    }

    const role = user.publicMetadata?.role as string | undefined
    if (role !== 'teacher' && role !== 'admin') return null

    const name =
      user.firstName || user.username || user.emailAddresses[0]?.emailAddress || 'Teacher'

    return {
      userId,
      name,
      role: role as 'teacher' | 'admin',
    }
  } catch (error) {
    console.error('Error getting teacher user:', error)
    return null
  }
}

/**
 * Check teacher status and throw error if not teacher
 * Use this in server actions
 */
export async function requireTeacherAction(): Promise<{
  userId: string
  name: string
  role: 'teacher' | 'admin'
}> {
  const teacher = await getTeacherUser()
  if (!teacher) {
    throw new Error('Unauthorized: Teacher access required')
  }
  return teacher
}

/**
 * Check if user has teacher or admin role
 * More permissive check for features accessible to both
 */
export async function hasTeacherAccess(): Promise<boolean> {
  return isUserTeacher()
}
