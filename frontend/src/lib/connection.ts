import { apiFetch } from "./api";
import { ConnectionInfo } from "./types";
import { getRefreshToken } from "@descope/nextjs-sdk/client";

export const fetchCalendarConnections = async (token: string) => {
  const data = await apiFetch<{ connections: ConnectionInfo }>(
    "/api/connections",
    { token },
  );

  return data.connections;
};

export const connectCalendar = async (token: string) => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token is not available");
  }

  const result = await apiFetch<{ url: string }>("/api/connections/connect", {
    method: "POST",
    token,
    body: {
      redirectUrl: `${window.location.origin}/dashboard`,
      refreshToken,
    },
  });
  window.location.href = result.url;
};

export const refreshCalendarConnection = async (token: string) => {
  await apiFetch<{ connection: ConnectionInfo }>(
    "/api/connections/refresh-status",
    {
      method: "POST",
      token,
    },
  );
};
