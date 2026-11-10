import { getAgentInstructions } from "../config/agent-instructions";
import { createAgentMemory } from "../config/memory";
import {Agent} from "@mastra/core/agent"
import { createCalendarTools } from "./agent-tools.service";

export type AgentEvent = {
  type: "started" | "progress" | "token" | "completed" | "error";
  message?: string;
  token?: string;
};

export type StreamAgentReplyInput = {
  userId: string;
  authUserId: string;
  threadId: string;
  message: string;
  onEvent: (event: AgentEvent) => void;
};

export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function modelName() {
  return process.env.GEMINI_MODEL_NAME || "gemini-flash-latest";
}

function messageText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!content || typeof content !== "object") return "";

  const record = content as {
    content?: unknown;
    parts?: Array<{ type?: string; text?: string }>;
  };

  if (typeof record.content === "string" && record.content.trim()) {
    return record.content.trim();
  }

  if (!Array.isArray(record.parts)) return "";
  return record.parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text!.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export const streamAgentReply = async (
  input:StreamAgentReplyInput
) => {
    if(!process.env.API_KEY){
      throw new Error("API_KEY is not set in the environment variables.");
    }

    input.onEvent({
      type: "started",
      message: "Agent is planing the reply...",
    });

   const memory = createAgentMemory();

  const agent = new Agent({
    id: "metting-assistant",
    name: "Meeting Assitant",
    instructions: getAgentInstructions(),
    model: modelName(),
    tools: createCalendarTools(input.authUserId),
    memory,
  });
};
