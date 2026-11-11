import "dotenv/config";
import cors from "cors";
import express from "express";
import { getPool } from "./db/pool";
import connectionRoutes from "./routes/connection.routes";
import { agentRoutes } from "./routes/agent.routes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const appOrigin = process.env.APP_URL || "http://localhost:3000";

app.use(
  cors({
    origin: appOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await getPool().query("SELECT 1"); // Simple query to check database connectivity
    res.json({ status: "ok", service: "agentic-ai-calendar-assistant", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.use('/api/connections', connectionRoutes);
app.use('/api/agent', agentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});