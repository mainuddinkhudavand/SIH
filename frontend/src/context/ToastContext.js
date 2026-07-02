import React, { createContext, useState, useCallback } from "react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // auto-hide after 3s
  }, []);

  const getToastStyle = (type) => {
    switch (type) {
      case "success":
        return { backgroundColor: "#d4edda", color: "#155724" };
      case "error":
        return { backgroundColor: "#f8d7da", color: "#721c24" };
      case "warning":
        return { backgroundColor: "#fff3cd", color: "#856404" };
      case "info":
        return { backgroundColor: "#d1ecf1", color: "#0c5460" };
      default:
        return { backgroundColor: "#e2e3e5", color: "#383d41" };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 9999,
            transition: "all 0.3s ease-in-out", // ✅ smooth animation
            ...getToastStyle(toast.type),
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};