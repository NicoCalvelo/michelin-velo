"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(end: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let frameId: number;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
      setValue(Math.floor(eased * end));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration]);

  return value;
}

export function Counter({
  end,
  duration = 1500,
  prefix = "",
  suffix = "",
  style,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}) {
  const value = useCountUp(end, duration);

  return (
    <span className="typo-h1" style={style}>
      {prefix}
      {value.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}
