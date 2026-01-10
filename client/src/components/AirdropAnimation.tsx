import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function AirdropAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        initial={{ 
          y: "-30%", 
          x: "80%", 
          opacity: 0,
          rotate: -15
        }}
        animate={{ 
          // Path that starts above and ends completely below the section (150%)
          y: ["-30%", "20%", "50%", "80%", "150%"],
          // Wider horizontal movement for a more pronounced S-shape
          x: ["80%", "0%", "100%", "0%", "80%"],
          // Stay fully opaque while visible in the section
          opacity: [0, 0.4, 0.4, 0.4, 0],
          rotate: [-15, 15, -15, 15, -15]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          // Opacity control: fade in quickly at top, fade out at very bottom
          times: [0, 0.1, 0.5, 0.9, 1]
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
