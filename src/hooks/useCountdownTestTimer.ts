import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }

        if (prev === warningThresholdSeconds) setIsWarning(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, warningThresholdSeconds]);

  return { timeLeft, isWarning, isTimeUp };
}
