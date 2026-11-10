import { Router } from "express";
import { z } from "zod";
import { requireSession } from "../middleware/requireSession";

export const agentRoutes = Router();

const chatSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  threadId: z.uuid(),
});

const threadIdSchema = z.uuid();

agentRoutes.use(requireSession);

agentRoutes.get("/threads", async (req, res) => {
  try {
    const threads = await listUserThreads();
    res.json({ threads, success: true });
  } catch {
    res.status(500).json({ error: "could not fetch threads", success: false });
  }
});

agentRoutes.get("/threads/:threadId", async (req, res) => {
  const parsed = threadIdSchema.safeParse(req.params.threadId);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid threadId", success: false });
    return;
  }
  try {
    const messages = await getThreadMessages();

    res.json({ threadId: parsed.data, messages, success: true });
  } catch {
    res.status(500).json({ error: "could not fetch thread", success: false });
  }
});

agentRoutes.post("/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "invalid request body", success: false });
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const write = (event: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await streamAgentReply();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    write({ type: "error", message });
  } finally {
    res.end();
  }
});
