import type { Request, Response, NextFunction } from "express";
import { descopeClient } from "../config/descope";
import { ensureUser } from "../repositories/user.repository";

export type AuthContext = {
  authUserId: string;
  email?: string;
  name?: string;
  userId: string;
  token: Record<string, any>;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", success: false });
  }

  try {
    const authInfo = await descopeClient.validateSession(token);
    const claims = authInfo.token as Record<string, unknown>;
    const authUserId = String(claims.sub ?? "");

    if (!authInfo) {
      return res.status(401).json({ error: "Unauthorized", success: false });
    }

    const email = typeof claims.email === "string" ? claims.email : undefined;
    const user = await ensureUser({
      authUserId,
      email,
    })

    req.auth = {
      authUserId,
      email,
      name: typeof claims.name === "string" ? claims.name : undefined,
      userId: user.id,
      token: claims,
    }
    next();
  } catch (error) {
    console.error("Error validating session:", error);
    return res.status(401).json({ error: "Unauthorized", success: false });
  }
}
