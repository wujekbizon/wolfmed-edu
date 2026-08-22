"use server";

import { auth } from "@clerk/nextjs/server";
import { hasAccessToTier } from "@/helpers/accessTiers";
import { getEffectiveEnrollmentGrants } from "@/helpers/getEffectiveEnrollmentGrants";
import { getUserEnrollmentGrants, getUserEnrollments } from "@/server/queries";

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
    const enrollments = await getUserEnrollments(userId)
    const enrollment = enrollments.find((item) => item.courseSlug === courseSlug)

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
  if (!userId) return { enrollments: [], enrollmentGrants: [] }

  try {
    const enrollmentGrants = await getUserEnrollmentGrants(userId)
    return {
      enrollments: getEffectiveEnrollmentGrants(enrollmentGrants),
      enrollmentGrants,
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return { enrollments: [], enrollmentGrants: [] }
  }
}

/** Check if the current user has premium access on either course. */
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
