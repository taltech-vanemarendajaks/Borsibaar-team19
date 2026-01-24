"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * A wrapper around fetch that automatically redirects to /login
 * if a 401 Unauthorized response is received.
 */
export function useAuthFetch() {
    const router = useRouter();

    const authFetch = useCallback(
        async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            try {
                const res = await fetch(input, init);
                if (res.status === 401) {
                    router.push("/login");
                }
                return res;
            } catch (error) {
                throw error;
            }
        },
        [router]
    );

    return authFetch;
}
