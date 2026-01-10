import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PLATFORM_CONFIG } from "@shared/config";

interface FallingIcon {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function AirdropAnimation() {
  const [icons, setIcons] = useState<FallingIcon[]>([]);

  useEffect(() => {
    // Generate 15 random falling icons
    const newIcons = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 30 + Math.random() * 40,
    }));
    setIcons(newIcons);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          initial={{ y: -100, x: `${icon.x}%`, opacity: 0, rotate: 0 }}
          animate={{ 
            y: "120vh", 
            opacity: [0, 1, 1, 0],
            rotate: 360 
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            delay: icon.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: icon.size,
            height: icon.size,
          }}
        >
          <img 
            src={PLATFORM_CONFIG.ASSETS.LANDING_MASCOT} 
            alt="" 
            className="w-full h-full object-contain opacity-40 blur-[1px]"
          />
        </motion.div>
      ))}
    </div>
  );
}
