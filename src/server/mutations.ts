"use server"

import "server-only"
import { db } from "@/server/db/index"
import { testSessions, users } from "./db/schema"
import { eq, and } from "drizzle-orm"

/**
 * Expire an active test session
 */
export async function expireTestSession(sessionId: string, userId: string) {
  const now = new Date()
    console.log("sessionId", sessionId)
  await db.transaction(async (tx) => {
    // Lock and verify session ownership and status
    const [session] = await tx
      .select()
      .from(testSessions)
      .where(
        and(eq(testSessions.id, sessionId), eq(testSessions.userId, userId))
      )
      .for("update")

    if (!session) {
      return
    }
    console.log("session.status", session.status)

    if (session.status === "ACTIVE") {
      await tx
        .update(testSessions)
        .set({ status: "EXPIRED", finishedAt: now })
        .where(eq(testSessions.id, sessionId))
    }
  })
}