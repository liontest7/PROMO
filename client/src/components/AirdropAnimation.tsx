import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-30%", 
          x: "80%", 
          opacity: 1,
          rotate: -15
        }}
        animate={{ 
          // Extended descent to 160% to ensure it fully exits the section bottom before reset
          y: ["-30%", "20%", "60%", "100%", "160%"],
          // Balanced horizontal sway
          x: ["80%", "10%", "90%", "10%", "80%"],
          rotate: [-15, 15, -15, 15, -15],
          opacity: [1, 1, 1, 1, 1]
        }}
        transition={{
          duration: 30, // Calmer speed as requested
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="absolute w-40 h-40 md:w-56 md:h-56"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain"
          style={{ 
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.3))",
            backgroundColor: "transparent"
          }} 
        />
      </motion.div>
    </div>
  );
}
