// FPSCounter.tsx
import React, { useEffect, useRef } from "react";

interface FPSCounterProps {
  getCurrentFPS: () => number;
  updateInterval?: number; // Optional debounce interval for updating FPS display
}

const FPSCounter: React.FC<FPSCounterProps> = ({ getCurrentFPS, updateInterval = 500 }) => {
  const fpsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastUpdateTime = performance.now();

    const updateFpsDisplay = () => {
      if (fpsRef.current) {
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateInterval) {
          fpsRef.current.textContent = `FPS: ${getCurrentFPS()}`;
          lastUpdateTime = currentTime;
        }
      }
      requestAnimationFrame(updateFpsDisplay);
    };

    updateFpsDisplay(); // Start the loop
  }, [getCurrentFPS, updateInterval]);

  return <div ref={fpsRef} className="absolute top-2 right-2 p-1 text-green-400 select-none"></div>;
};

export default FPSCounter;
