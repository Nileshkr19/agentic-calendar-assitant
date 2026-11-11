import { getPool } from "../db/pool";

export type ConnectionStatus = "connected" | "disconnected" | "pending";

export type currentConnectionRow = {
  user_id: string;
  provider: string;
  status: ConnectionStatus;
};

export const getCalendarConnectionRow = async (userId: string) => {
  // Implementation for fetching calendar connection row

  const result = await getPool().query<currentConnectionRow>(
    `
        SELECT user_id, provider, status
        FROM connections
        WHERE user_id = $1 AND provider = 'google-calendar'
        `,
    [userId],
  );
  return result.rows[0] ?? null;
};

export const upsertCalendarConnectionRow = async (input: {
  userId: string;
  status: ConnectionStatus;
}) => {
  const result = await getPool().query<currentConnectionRow>(
    `
        INSERT INTO connections (user_id, provider, status)
        VALUES ($1, 'google-calendar', $2)
        ON CONFLICT (user_id, provider)
        DO UPDATE SET status = EXCLUDED.status
        RETURNING user_id, provider, status
        `,
    [input.userId, input.status],
  );
  return result.rows[0];
};
