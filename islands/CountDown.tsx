import { useEffect, useState } from "preact/hooks";

interface CountdownProps {
  start?: number; // number to count down from (default 3)
  onComplete?: () => void; // callback when countdown finishes
}

export default function Countdown({ start = 3, onComplete }: CountdownProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (count === 0) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div class="countdown text-6xl font-bold text-center">
      {count > 0 ? count : "Go!"}
    </div>
  );
}
