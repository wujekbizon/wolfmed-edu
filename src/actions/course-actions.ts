"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db/index";
import { courseEnrollments } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasAccessToTier } from "@/helpers/accessTiers";
import { getUserEnrollments } from "@/server/queries";

/**
 * Check if user has access to a specific course.
 *
 * Uses only `auth()` (cookie-based, no Clerk API call) for the user id and the
 * DB enrollment row as the authoritative source. The previous `currentUser()`
 * fast-path made a Clerk API request on every call; because this runs once per
 * category on the learning hub (fanned out via Promise.all), it tripped Clerk's
 * dev-instance rate limit (429). The DB query is already authoritative, so the
 * metadata pre-check added load without changing the result.
 */
export async function checkCourseAccessAction(courseSlug: string) {
  const { userId } = await auth();

  if (!userId) {
    return { hasAccess: false, accessTier: null };
  }

  try {
    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseSlug, courseSlug),
          eq(courseEnrollments.isActive, true)
        )
      )
      .limit(1);

    if (enrollment) {
      return {
        hasAccess: true,
        accessTier: enrollment.accessTier,
      };
    }

    return { hasAccess: false, accessTier: null };
  } catch (error) {
    console.error("Error checking course access:", error);
    return { hasAccess: false, accessTier: null };
  }
}

/**
 * Get all courses the user is enrolled in
 */
export async function getUserEnrollmentsAction() {
  const { userId } = await auth()
  if (!userId) return { enrollments: [] }

  try {
    const enrollments = await getUserEnrollments(userId)
    return { enrollments }
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return { enrollments: [] }
  }
}

/**
 * Check if the current user has premium (or higher) access on either course.
 * Uses the same two-layer check as checkCourseAccessAction:
 * Clerk metadata for fast-path ownership, DB for authoritative tier.
 */
export async function checkPremiumAccessAction(): Promise<boolean> {
  const [opiekun, pielegniarstwo] = await Promise.all([
    checkCourseAccessAction('opiekun-medyczny'),
    checkCourseAccessAction('pielegniarstwo'),
  ])
  return (
    (opiekun.hasAccess && hasAccessToTier(opiekun.accessTier ?? 'free', 'premium')) ||
    (pielegniarstwo.hasAccess && hasAccessToTier(pielegniarstwo.accessTier ?? 'free', 'premium'))
  )
}

/**
 * Enroll user in a course (used by webhook)
 */
export async function enrollUserAction(
  userId: string,
  courseSlug: string,
  accessTier: string = "basic"
) {
  try {
    // Check if enrollment exists
    const [existing] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseSlug, courseSlug)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing enrollment
      await db
        .update(courseEnrollments)
        .set({
          isActive: true,
          accessTier,
          enrolledAt: new Date(),
        })
        .where(eq(courseEnrollments.id, existing.id));

      return { success: true, updated: true };
    }

    // Create new enrollment
    await db.insert(courseEnrollments).values({
      userId,
      courseSlug,
      accessTier,
      isActive: true,
    });

    return { success: true, updated: false };
  } catch (error) {
    console.error("Error enrolling user:", error);
    return { success: false, error: String(error) };
  }
}
