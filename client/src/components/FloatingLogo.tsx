import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";

export function FloatingLogo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <motion.div
        initial={{ x: -150, y: -150, rotate: 0 }}
        animate={{
          x: [
            -150, 
            180, 
            -120, 
            220, 
            -150
          ],
          y: [
            -150, 
            "25vh", 
            "50vh", 
            "75vh", 
            "110vh"
          ],
          rotate: [0, 120, -60, 240, 360]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        className="w-32 h-32 opacity-30 select-none drop-shadow-[0_0_35px_rgba(34,197,94,0.4)]"
      >
        <img 
          src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
          alt="" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
}
