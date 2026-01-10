import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-40%", // Start further up
          x: "80%", 
          opacity: 1, // Start fully opaque
          rotate: -15
        }}
        animate={{ 
          // Constant vertical speed: evenly spaced values for y
          y: ["-40%", "5%", "50%", "95%", "140%"],
          // Balanced horizontal sway
          x: ["80%", "10%", "90%", "10%", "80%"],
          // No opacity changes during the middle of the descent
          opacity: [1, 1, 1, 1, 1],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 30, // Even slower for constant, calm feel
          repeat: Infinity,
          ease: "linear", // CRITICAL for uniform motion
          times: [0, 0.25, 0.5, 0.75, 1] // Uniform time segments
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
