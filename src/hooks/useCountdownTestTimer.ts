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

export function useCountdownTestTimer({ durationMinutes, warningThresholdSeconds = 300 }: UseCountdownTestTimerProps): UseCountdownTestTimerReturn {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const endTime = useRef(Date.now() + durationMinutes * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= warningThresholdSeconds) setIsWarning(true);
      if (remaining === 0) {
        clearInterval(timer);
        setIsTimeUp(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, warningThresholdSeconds]);

  return { timeLeft, isWarning, isTimeUp };
}
