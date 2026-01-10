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
          // Use fixed viewport height (vh) to ensure it exits the screen regardless of section height
          // Path that starts above and ends completely below the viewport
          y: ["-50vh", "20vh", "50vh", "80vh", "150vh"],
          x: ["80%", "5%", "95%", "5%", "80%"],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 35, // Constant speed
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
