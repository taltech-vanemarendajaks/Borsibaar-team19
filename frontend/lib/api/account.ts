import { CurrentUser } from "../auth/getCurrentUser";

export const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const response = await fetch("/api/backend/account");
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
  return null;
};
