import axiosClient from "../utils/axiosClient";

/* ---------------- TYPES ---------------- */
export interface SyncUserPayload {
  clerkId: string;
  emailId?: string;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNo?: string | null;
}

export interface SyncUserResponse {
  success: boolean;
  user?: any;
  message?: string;
}

/* ---------------- API CALL ---------------- */
export const syncUserWithBackend = (
  data: SyncUserPayload
): Promise<SyncUserResponse> => {
  return axiosClient
    .post<SyncUserResponse>("/auth/sync", data)
    .then(res => res.data);
};
