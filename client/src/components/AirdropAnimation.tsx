import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-20%", 
          x: "80%", 
          opacity: 0,
          rotate: -15
        }}
        animate={{ 
          // Smooth S-shaped path that goes fully off-screen at the bottom (140%)
          y: ["-20%", "20%", "60%", "100%", "140%"],
          x: ["80%", "10%", "90%", "10%", "80%"],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 25, // Slower for a calmer feel
          repeat: Infinity,
          ease: "easeInOut", // Smoother transitions between points
          times: [0, 0.15, 0.5, 0.85, 1]
        }}
        className="absolute w-40 h-40 md:w-56 md:h-56"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain opacity-30 drop-shadow-[0_30px_60px_rgba(0,0,0,0.3)] blur-[0.3px]"
        />
      </motion.div>
    </div>
  );
}
