"use client";

import { useSnackbar } from "@/contexts/snackbar-context";
import { useCallback } from "react";

export interface FetchErrorResponse {
  error: string;
  details?: unknown;
  status?: number;
}

export function useApiError() {
  const { showError } = useSnackbar();

  const handleError = useCallback(
    async (response: Response, defaultMessage: string = "An error occurred") => {
      try {
        const data = (await response.json()) as FetchErrorResponse;
        const errorMessage = data.error || defaultMessage;
        showError(errorMessage);
        return data;
      } catch {
        // If can't parse JSON, show the response text
        const text = await response.text();
        const errorMessage = text || defaultMessage;
        showError(errorMessage);
        return { error: errorMessage };
      }
    },
    [showError]
  );

  const handleFetchError = useCallback(
    (error: Error) => {
      const message = error?.message || "Failed to fetch data";
      showError(message);
      return { error: message };
    },
    [showError]
  );

  return { handleError, handleFetchError };
}
