"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SnackbarType = "default" | "success" | "error" | "warning" | "info"

const typeStyles: Record<SnackbarType, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-600 text-white",
  info: "bg-blue-600 text-white",
}

export interface SnackbarProps {
  id: string
  message: string
  type?: SnackbarType
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export const Snackbar = React.forwardRef<
  HTMLDivElement,
  SnackbarProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      id,
      message,
      type = "default",
      duration = 5000,
      onClose,
      action,
      className,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          onClose?.()
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        aria-label={message}
        className={cn(
          "pointer-events-auto mb-3 flex items-center gap-3 rounded-md px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 duration-300",
          typeStyles[type],
          className
        )}
        {...props}
      >
        <span className="flex-1 text-sm font-medium">{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-2 whitespace-nowrap text-sm font-semibold underline opacity-90 hover:opacity-100"
          >
            {action.label}
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close snackbar"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    )
  }
)

Snackbar.displayName = "Snackbar"
