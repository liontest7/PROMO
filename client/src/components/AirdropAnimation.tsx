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
          // Extended descent to 140% to ensure it fully exits the section bottom
          y: ["-20%", "20%", "60%", "100%", "140%"],
          x: ["80%", "0%", "100%", "0%", "80%"],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 20, // Slightly faster speed as requested
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="absolute w-40 h-40 md:w-56 md:h-56"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain mix-blend-normal bg-transparent"
          style={{ filter: "none" }} // Ensure no filters/shadows create circles
        />
      </motion.div>
    </div>
  );
}
