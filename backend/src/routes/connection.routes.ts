import { Router } from "express";
import { requireSession } from "../middleware/requireSession";
import {
  getCalendarConnections,
  createCalendarConnectUrl,
  refreshCalendarConnectionStatus,
} from "../services/connection.service";

const router = Router();

router.use(requireSession);

router.get("/", async (req, res) => {
  try {
    const connections = await getCalendarConnections(req.auth!.userId);

    res.json({ connections, success: true });
  } catch {
    res
      .status(500)
      .json({ error: "could not fetch connections", success: false });
  }
});

router.post("/connect", async (req, res) => {
  try {
    const refreshToken =
      typeof req.body.refreshToken === "string" ? req.body.refreshToken : "";

    if (!refreshToken) {
      res
        .status(400)
        .json({ error: "refreshToken is required", success: false });
      return;
    }

    const redirectUrl =
      typeof req.body.redirectUrl === "string"
        ? req.body.redirectUrl
        : `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`;

    const result = await createCalendarConnectUrl({
      userId: req.auth!.userId,
      refreshToken,
      redirectUrl,
    });
    res.json({ url: result, success: true });
  } catch {
    res.status(500).json({ error: "could not connect", success: false });
  }
});

router.post('/refresh-status' , async (req, res) => {
    try {
        const connection = await refreshCalendarConnectionStatus(
           { userId: req.auth!.userId,
            authUserId: req.auth!.authUserId}
        )

        res.json({ connection, success: true });

    }
    catch {
        res.status(500).json({ error: "could not refresh status", success: false });
    }

})



export default router;
