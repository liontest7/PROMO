import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-10%", 
          x: "80%", 
          opacity: 0,
          rotate: -20
        }}
        animate={{ 
          // Large S-shaped path
          y: ["-10%", "20%", "50%", "80%", "110%"],
          x: ["80%", "20%", "80%", "20%", "80%"],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-20, 20, -20, 20, -20]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          // Use a custom times array to control the segments of the S
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="absolute w-32 h-32 md:w-48 md:h-48"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain opacity-40 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] blur-[0.5px]"
        />
      </motion.div>
    </div>
  );
}
