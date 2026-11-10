import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { resolve } from "node:path";

const dbPath = resolve(process.cwd(), "mastra.db");

export const memoryStore = new LibSQLStore({
  id: "metting-assistant-memory",
  url: `file:${dbPath}`,
});

export const createAgentMemory = () => {
  return new Memory({
    storage: memoryStore,
    options: {
      lastMessages: 20,
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# Meeting Prefrences
                - Timezone:
                - Default meeting length(minutes):
                - Preferred meeting hours;
                - Usual invitees:
                - Notes:
                `,
      },
    },
  });
};
