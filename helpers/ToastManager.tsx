import { toast } from "sonner";

export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToastOptions {
  description?: string;
  position?: ToastPosition;
}

const DEFAULT_POSITION: ToastPosition = "top-right";

/**
 * ToastManager - Utility for displaying toast notifications
 * Uses Sonner toast from shadcn/ui
 */
export class ToastManager {
  /**
   * Display success toast
   * @param message - Success message to display
   * @param options - Optional description and position
   */
  static success(message: string, options?: ToastOptions | string) {
    const opts = typeof options === "string" ? { description: options } : options;
    toast.success(message, {
      description: opts?.description,
      position: opts?.position ?? DEFAULT_POSITION,
      closeButton: true,
    });
  }

  /**
   * Display error toast
   * @param message - Error message to display
   * @param options - Optional description and position
   */
  static error(message: string, options?: ToastOptions | string) {
    const opts = typeof options === "string" ? { description: options } : options;
    toast.error(message, {
      description: opts?.description,
      position: opts?.position ?? DEFAULT_POSITION,
      closeButton: true,
    });
  }

  /**
   * Display warning toast
   * @param message - Warning message to display
   * @param options - Optional description and position
   */
  static warning(message: string, options?: ToastOptions | string) {
    const opts = typeof options === "string" ? { description: options } : options;
    toast.warning(message, {
      description: opts?.description,
      position: opts?.position ?? DEFAULT_POSITION,
      closeButton: true,
    });
  }

  /**
   * Display info toast
   * @param message - Info message to display
   * @param options - Optional description and position
   */
  static info(message: string, options?: ToastOptions | string) {
    const opts = typeof options === "string" ? { description: options } : options;
    toast.info(message, {
      description: opts?.description,
      position: opts?.position ?? DEFAULT_POSITION,
      closeButton: true,
    });
  }

  /**
   * Display loading toast
   * @param message - Loading message to display
   * @param position - Optional position
   * @returns Toast ID for dismissing later
   */
  static loading(message: string, position?: ToastPosition) {
    return toast.loading(message, { 
      position: position ?? DEFAULT_POSITION,
      closeButton: true,
    });
  }

  /**
   * Display promise toast with loading, success, and error states
   * @param promise - Promise to track
   * @param messages - Messages for loading, success, and error states
   */
  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return toast.promise(promise, messages);
  }

  /**
   * Dismiss a specific toast by ID
   * @param toastId - ID of the toast to dismiss
   */
  static dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all active toasts
   */
  static dismissAll() {
    toast.dismiss();
  }
}

export default ToastManager;
