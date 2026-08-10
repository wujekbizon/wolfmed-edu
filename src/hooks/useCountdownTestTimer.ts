import { useState, useEffect, useRef } from 'react';

interface UseCountdownTestTimerProps {
  expiresAt?: string;
  durationMinutes?: number;
  warningThresholdSeconds?: number;
}

interface UseCountdownTestTimerReturn {
  timeLeft: number;
  isWarning: boolean;
  isTimeUp: boolean;
}

/**
 * Drift-free countdown timer for test sessions.
 * Anchors to a wall-clock end timestamp via useRef so displayed time stays
 * accurate even if the browser throttles the tab or skips ticks.
 *
 * @param expiresAt Absolute server session deadline when persistence across reloads is required
 * @param durationMinutes Relative duration for non-persistent exam flows
 * @param warningThresholdSeconds Seconds remaining at which isWarning becomes true (default 300)
 */
export function getRemainingSeconds(expiresAt: string | number, now = Date.now()) {
  const deadline = new Date(expiresAt).getTime()
  if (!Number.isFinite(deadline)) return 0
  return Math.max(0, Math.floor((deadline - now) / 1000))
}

export function useCountdownTestTimer({ expiresAt, durationMinutes, warningThresholdSeconds = 300 }: UseCountdownTestTimerProps): UseCountdownTestTimerReturn {
  const endTime = useRef(
    expiresAt ? new Date(expiresAt).getTime() : Date.now() + (durationMinutes ?? 0) * 60 * 1000
  )
  const [timeLeft, setTimeLeft] = useState(() => getRemainingSeconds(endTime.current));

  useEffect(() => {
    endTime.current = expiresAt
      ? new Date(expiresAt).getTime()
      : Date.now() + (durationMinutes ?? 0) * 60 * 1000
    setTimeLeft(getRemainingSeconds(endTime.current));

    const timer = setInterval(() => {
      const remaining = getRemainingSeconds(endTime.current);
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, durationMinutes]);

  // Derived from timeLeft — avoids separate useState calls and the extra
  // re-renders they would cause on every tick.
  const isWarning = timeLeft <= warningThresholdSeconds;
  const isTimeUp = timeLeft === 0;

  return { timeLeft, isWarning, isTimeUp };
}
