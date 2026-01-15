"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/server/db/index";
import { courseEnrollments } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Check if user has access to a specific course
 * Checks both Clerk metadata (fast) and database (fallback)
 */
export async function checkCourseAccessAction(courseSlug: string) {
  const { userId } = await auth();

  if (!userId) {
    return { hasAccess: false, accessTier: null };
  }

  try {
    // Check Clerk metadata first for performance
    const user = await currentUser();
    const ownedCourses = (user?.publicMetadata?.ownedCourses as string[]) || [];

    if (ownedCourses.includes(courseSlug)) {
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

      return {
        hasAccess: true,
        accessTier: enrollment?.accessTier || "basic",
      };
    }

    // Fallback: check database directly
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
  const { userId } = await auth();

  if (!userId) {
    return { enrollments: [] };
  }

  try {
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.isActive, true)
        )
      );

    return { enrollments };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { enrollments: [] };
  }
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
