import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function FloatingLogo() {
  return (
    <motion.div
      initial={{ x: -100, y: -100, rotate: 0 }}
      animate={{
        x: [
          -100,
          100,
          -100,
          window.innerWidth + 100
        ],
        y: [
          -100,
          300,
          600,
          window.innerHeight + 100
        ],
        rotate: [0, 180, 360, 720]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="fixed z-[100] w-16 h-16 pointer-events-none opacity-40 select-none"
    >
      <img 
        src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
        alt="" 
        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
      />
    </motion.div>
  );
}
