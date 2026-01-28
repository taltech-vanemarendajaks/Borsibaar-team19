"use client"

import React from "react"
import { Snackbar } from "@/components/ui/snackbar"
import { useSnackbar } from "@/contexts/snackbar-context"

export function SnackbarContainer() {
  const { snackbars, removeSnackbar } = useSnackbar()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-md flex-col">
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          {...snackbar}
          onClose={() => removeSnackbar(snackbar.id)}
        />
      ))}
    </div>
  )
}
