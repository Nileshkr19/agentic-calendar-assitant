import { getPool } from "../db/pool";

export type currentUserRowInfo = {
  id: string,
  auth_user_id: string,
  email: string | null,
  created_at: Date,
};

export async function ensureUser(input: {
    authUserId: string,
    email?: string,
  
}): Promise<currentUserRowInfo> {
    const result =  getPool().query<currentUserRowInfo>(
        `
        INSERT INTO users (auth_user_id, email)
        VALUES ($1, $2)
        ON CONFLICT (auth_user_id)
        DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
        RETURNING *
        `,
        [input.authUserId, input.email ?? null],
    )

    const user = (await result).rows[0];
    return user;
}