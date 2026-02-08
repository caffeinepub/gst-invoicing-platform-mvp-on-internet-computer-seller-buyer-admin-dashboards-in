import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number; // milliseconds
  className?: string;
  suffix?: string;
}

export default function AnimatedNumber({ 
  value, 
  decimals = 2, 
  duration = 500,
  className = '',
  suffix = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValueRef.current + (value - startValueRef.current) * easeProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
