'use client';
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[110]">
        <motion.div
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-full bg-primary"
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Subtle Logo Pulse */}
        <motion.div
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
            scale: [0.98, 1, 0.98]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }}
        >
          <img src="/brand/logo-32.png" alt="Logo" className="w-12 h-12 grayscale opacity-20" />
        </motion.div>
      </div>
    </div>
  );
}
