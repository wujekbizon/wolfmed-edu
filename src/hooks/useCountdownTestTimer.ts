import { useState, useEffect, useRef } from 'react';

interface UseCountdownTestTimerProps {
  durationMinutes: number;
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
 * @param durationMinutes Total test duration in minutes
 * @param warningThresholdSeconds Seconds remaining at which isWarning becomes true (default 300)
 */
export function useCountdownTestTimer({ durationMinutes, warningThresholdSeconds = 300 }: UseCountdownTestTimerProps): UseCountdownTestTimerReturn {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const endTime = useRef(Date.now() + durationMinutes * 60 * 1000);

  useEffect(() => {
    // Reset end time and displayed value whenever durationMinutes changes —
    // without this, the interval would compute remaining time against the
    // stale ref from the previous duration.
    endTime.current = Date.now() + durationMinutes * 60 * 1000;
    setTimeLeft(durationMinutes * 60);

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes]);

  // Derived from timeLeft — avoids separate useState calls and the extra
  // re-renders they would cause on every tick.
  const isWarning = timeLeft <= warningThresholdSeconds;
  const isTimeUp = timeLeft === 0;

  return { timeLeft, isWarning, isTimeUp };
}
