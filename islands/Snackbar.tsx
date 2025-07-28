import { createContext } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { ComponentChildren } from "preact";
import { signal } from "@preact/signals";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  gameId?: string;
}

const toasts = signal<ToastMessage[]>([]);

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastMessage["type"],
    duration?: number,
    gameId?: string,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-gray-800",
  };

  useEffect(() => {
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.id, toast.duration, onClose]);

  const ariaLive = toast.type === "error" ? "assertive" : "polite";

  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      class={`
        p-4 mb-3 rounded-lg shadow-lg
        flex items-center justify-between space-x-4
        transform transition-all duration-300 ease-in-out
        ${typeClasses[toast.type]}
        ${
        isVisible
          ? "animate-toast-slide-in opacity-100 translate-y-0"
          : "animate-toast-slide-out opacity-0 translate-y-5"
      }
        pointer-events-auto
      `}
    >
      <div class="flex-1 text-sm font-medium">
        <p>{toast.message}</p>
        {toast.gameId && (
          <a
            href={`/game/${toast.gameId}`}
            onClick={() => onClose(toast.id)}
            class="mt-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-opacity-70 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current-color focus:ring-opacity-70 transition-colors duration-200"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            View Game
            <svg
              class="ml-1 h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              >
              </path>
            </svg>
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        class="text-white opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
        aria-label="Close notification"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          >
          </path>
        </svg>
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children: ComponentChildren;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const showToast = useCallback((
    message: string,
    type: ToastMessage["type"] = "info",
    duration: number = 18000,
    gameId?: string,
  ) => {
    const newToast: ToastMessage = {
      id: generateId(),
      message,
      type,
      duration,
      gameId,
    };
    toasts.value = [...toasts.value, newToast];
  }, []);

  const removeToast = useCallback((id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end max-w-xs w-full pointer-events-none">
        {toasts.value.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
