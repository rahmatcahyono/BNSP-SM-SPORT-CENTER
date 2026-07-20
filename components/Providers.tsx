"use client";

import React, { createContext, useContext, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Alert } from "@heroui/react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string | undefined, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string | undefined, type: ToastType = "info") => {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <SessionProvider>
      <ToastContext.Provider value={{ toast }}>
        {children}
          {/* Floating Toast Notification Container */}
          <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto">
            {toasts.map((t) => {
              const statusMap = {
                success: "success",
                error: "danger",
                info: "default"
              } as const;
              
              return (
                <div key={t.id} className="animate-fade-in transition-all duration-300 mb-2">
                  <Alert 
                    status={statusMap[t.type]}
                    className="shadow-xl"
                  >
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{t.message}</Alert.Title>
                    </Alert.Content>
                    <button 
                      onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                      className="ml-auto p-1 opacity-50 hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </Alert>
                </div>
              );
            })}
          </div>
      </ToastContext.Provider>
    </SessionProvider>
  );
}
