"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react"
import { SnackbarProps } from "@/components/ui/snackbar"

interface SnackbarContextType {
  snackbars: SnackbarProps[]
  addSnackbar: (config: Omit<SnackbarProps, "id">) => string
  removeSnackbar: (id: string) => void
  showError: (message: string, duration?: number) => string
  showSuccess: (message: string, duration?: number) => string
  showWarning: (message: string, duration?: number) => string
  showInfo: (message: string, duration?: number) => string
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarProps[]>([])

  const addSnackbar = useCallback((config: Omit<SnackbarProps, "id">): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const snackbar: SnackbarProps = {
      id,
      ...config,
      duration: config.duration ?? 5000,
    }

    setSnackbars((prev) => [...prev, snackbar])
    return id
  }, [])

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const showError = useCallback(
    (message: string, duration?: number) => {
      return addSnackbar({
        message,
        type: "error",
        duration,
      })
    },
    [addSnackbar]
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return addSnackbar({
        message,
        type: "success",
        duration,
      })
    },
    [addSnackbar]
  )

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      return addSnackbar({
        message,
        type: "warning",
        duration,
      })
    },
    [addSnackbar]
  )

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      return addSnackbar({
        message,
        type: "info",
        duration,
      })
    },
    [addSnackbar]
  )

  return (
    <SnackbarContext.Provider
      value={{
        snackbars,
        addSnackbar,
        removeSnackbar,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider")
  }
  return context
}
