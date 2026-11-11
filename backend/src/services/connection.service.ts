import {
  CALENDAR_CONNECTION_ID,
  CALENDAR_CONNECTION_LABEL,
  descopeClient,
} from "../config/descope";
import {
  getCalendarConnectionRow,
  upsertCalendarConnectionRow,
} from "../repositories/connection.repository";

const calendarAppId = () => {
  if (!CALENDAR_CONNECTION_ID) {
    throw new Error(
      "CALENDAR_CONNECTION_ID is not set in environment variables.",
    );
  }
  return CALENDAR_CONNECTION_ID;
};

export const getCalendarConnections = async (userId: string) => {
  const row = await getCalendarConnectionRow(userId);

  return {
    label: CALENDAR_CONNECTION_LABEL,
    status: row?.status ?? ("disconnected" as const),
  };
};

export const createCalendarConnectUrl = async (input: {
  userId: string;
  refreshToken: string;
  redirectUrl: string;
}) => {
  const response = await descopeClient.outbound.connect(
    calendarAppId(),
    { redirectUrl: input.redirectUrl },
    input.refreshToken,
  );
  if (!response || !response.data?.url) {
    throw new Error("Failed to create calendar connect URL");
  }

  await upsertCalendarConnectionRow({
    userId: input.userId,
    status: "pending",
  });

  return response.data.url;
};

export const refreshCalendarConnectionStatus = async (input: {
  userId: string;
  authUserId: string;
}) => {
  const ManagementKey = process.env.DESCOPE_MANAGEMENT_KEY;

  if (!ManagementKey) {
    throw new Error(
      "Descope management key is not set in environment variables.",
    );
  }

  const response =
    await descopeClient.management.outboundApplication.fetchToken(
      calendarAppId(),
      input.authUserId,
    );
  const accessToken =
    response.ok && response.data
      ? (response.data as { accessToken?: string }).accessToken
      : undefined;
  const status = accessToken ? "connected" : "disconnected";

  const row = await upsertCalendarConnectionRow({
    userId: input.userId,
    status,
  });
  return {
    label: CALENDAR_CONNECTION_LABEL,
    status: row.status,
  };
};
