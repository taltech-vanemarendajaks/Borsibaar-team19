/**
 * Backend URL Configuration
 *
 * BACKEND_URL: For server-side API routes (Next.js server → Backend)
 *   - Development: http://localhost:8080
 *   - Production: http://backend:8080 (Docker internal network)
 *   - Used by: All API routes in app/api/backend/**
 *
 * NEXT_PUBLIC_BACKEND_URL: For client-side browser access (Browser → Backend)
 *   - Development: http://localhost:8080
 *   - Production: http://193.40.157.195:8080 (public URL)
 *   - Used by: OAuth login button in login page
 *
 * Note: Browser API calls go through Next.js proxy, not directly to backend
 */
export const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
