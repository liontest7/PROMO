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
    // Generate 8 random falling icons (reduced for better focus)
    const newIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // percentage across screen, avoid edges
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10, // Slower descent
      size: 60 + Math.random() * 40, // Larger icons
    }));
    setIcons(newIcons);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          initial={{ 
            y: -200, 
            x: `${icon.x}%`, 
            opacity: 0, 
            rotate: -15 
          }}
          animate={{ 
            y: "120vh", 
            opacity: [0, 0.8, 0.8, 0],
            // Swaying motion from side to side
            x: [
              `${icon.x}%`, 
              `${icon.x + 5}%`, 
              `${icon.x - 5}%`, 
              `${icon.x + 3}%`, 
              `${icon.x}%`
            ],
            // Swaying rotation
            rotate: [-15, 15, -15, 15, -15]
          }}
          transition={{
            y: {
              duration: icon.duration,
              repeat: Infinity,
              delay: icon.delay,
              ease: "linear",
            },
            x: {
              duration: icon.duration / 4,
              repeat: Infinity,
              delay: icon.delay,
              ease: "easeInOut",
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              delay: icon.delay,
              ease: "easeInOut",
            },
            opacity: {
              duration: icon.duration,
              repeat: Infinity,
              delay: icon.delay,
              times: [0, 0.1, 0.9, 1]
            }
          }}
          style={{
            position: "absolute",
            width: icon.size,
            height: icon.size,
          }}
        >
          <img 
            src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
            alt="Falling Mascot" 
            className="w-full h-full object-contain opacity-60 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
          />
        </motion.div>
      ))}
    </div>
  );
}
