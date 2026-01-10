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
          rotate: -20
        }}
        animate={{ 
          // Large S-shaped path that goes fully off-screen at the bottom
          y: ["-20%", "20%", "50%", "80%", "120%"],
          x: ["80%", "20%", "80%", "20%", "80%"],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-20, 20, -20, 20, -20]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          // Control visibility so it's only hidden at the very start/end of the cycle
          times: [0, 0.1, 0.5, 0.9, 1]
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
