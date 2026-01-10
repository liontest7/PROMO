import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-20%", 
          x: "80%", 
          opacity: 1,
          rotate: -15
        }}
        animate={{ 
          // Path that starts just above and ends just below the section
          // Using percentages relative to the container for better stability
          y: ["-20%", "20%", "50%", "80%", "120%"],
          x: ["80%", "10%", "90%", "10%", "80%"],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 35, // Slower, calmer speed
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="absolute w-48 h-48 md:w-64 md:h-64"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
        />
      </motion.div>
    </div>
  );
}
