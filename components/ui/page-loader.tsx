"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev < 5 ? prev + 1 : 0));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* F1 Starting Lights */}
        <div className="flex gap-4">
          {[0, 1, 2, 3, 4].map((light) => (
            <div
              key={light}
              className={`w-12 h-12 rounded-full border-4 border-gray-700 transition-all duration-200 ${
                light < activeLight
                  ? "bg-[#e10600] shadow-[0_0_25px_rgba(225,6,0,0.9)]"
                  : "bg-gray-800"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground font-semibold tracking-wider">
          LOADING...
        </p>
      </div>
    </div>
  );
}
