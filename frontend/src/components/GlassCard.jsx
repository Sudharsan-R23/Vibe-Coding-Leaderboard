import { motion } from "framer-motion";

export function GlassCard({ children, className = "", delay = 0, ...rest }) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      {...rest}
    >
      {children}
      <style>{`
        .glass-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 20px 50px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </motion.div>
  );
}
