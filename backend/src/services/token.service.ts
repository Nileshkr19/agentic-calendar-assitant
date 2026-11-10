import { CALENDAR_CONNECTION_ID, descopeClient } from "../config/descope";

export const getCalendarAccessToken = async (authUserId: string) => {
  if (!CALENDAR_CONNECTION_ID || !process.env.DESCOPE_MANAGEMENT_KEY) {
    throw new Error("Missing Descope configuration for calendar connection");
  }

  const response =
    await descopeClient.management.outboundApplication.fetchToken(
      CALENDAR_CONNECTION_ID,
      authUserId,
    );

  const accessToken =
    response.ok && response.data
      ? (response.data as { accessToken?: string }).accessToken
      : undefined;

  if (!accessToken) {
    throw new Error("Failed to fetch calendar access token");
  }

  return accessToken;
};
