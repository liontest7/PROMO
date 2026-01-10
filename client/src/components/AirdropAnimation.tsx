import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-100%", 
          x: "80%", 
          opacity: 1,
          rotate: -15
        }}
        animate={{ 
          // Reduced descent to 350% to minimize the delay before looping back
          y: ["-100%", "50%", "150%", "250%", "350%"],
          x: ["80%", "5%", "95%", "5%", "80%"],
          rotate: [-15, 15, -15, 15, -15],
          opacity: [1, 1, 1, 1, 1]
        }}
        transition={{
          duration: 25, // Slightly faster to compensate for shorter path and keep the loop snappy
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="absolute w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain"
          style={{ 
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.4))",
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            outline: "none",
            padding: 0,
            margin: 0
          }} 
        />
      </motion.div>
    </div>
  );
}
