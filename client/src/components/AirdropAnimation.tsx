import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-50%", 
          x: "80%", 
          opacity: 1,
          rotate: -15
        }}
        animate={{ 
          // Extended descent even further (500%) to guarantee it passes the section boundary
          y: ["-50%", "30%", "80%", "150%", "350%", "500%"],
          x: ["80%", "0%", "100%", "0%", "80%"],
          rotate: [-15, 15, -15, 15, -15],
          opacity: [1, 1, 1, 1, 1, 1]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.2, 0.4, 0.6, 0.8, 1]
        }}
        className="absolute w-40 h-40 md:w-56 md:h-56"
        style={{ zIndex: 0 }}
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="Falling Mascot" 
          className="w-full h-full object-contain"
          style={{ 
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.3))",
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            outline: "none"
          }} 
        />
      </motion.div>
    </div>
  );
}
