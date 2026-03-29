import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, toast.duration ?? 5200);
  }, []);

  const notify = useCallback(
    (message, type = "info") => push({ message, type }),
    [push]
  );

  const badgeUnlocked = useCallback(
    (badge) =>
      push({
        type: "badge",
        title: "Badge unlocked",
        badge,
        message: `${badge.icon} ${badge.name}`,
        duration: 6500,
      }),
    [push]
  );

  return (
    <ToastContext.Provider value={{ push, notify, badgeUnlocked }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast ${t.type === "badge" ? "toast-badge" : ""}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
            >
              {t.type === "badge" && t.badge ? (
                <>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {t.title} 🎉
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: "0.25rem",
                      fontSize: "1.05rem",
                    }}
                  >
                    {t.badge.icon} {t.badge.name}
                  </div>
                  <div
                    style={{
                      marginTop: "0.35rem",
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                    }}
                  >
                    {t.badge.description}
                  </div>
                </>
              ) : (
                <div>{t.message}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
