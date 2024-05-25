import fs from "fs-extra";
import path from "path";

const LOG_DIR = path.join(__dirname, "../../../logs");

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
}

export const logsServices = {
  getLogsByDate: async (date: string): Promise<LogEntry[]> => {
    try {
      const logFiles = await fs.readdir(LOG_DIR);
      const targetDate = new Date(date).toISOString().split("T")[0];

      const logContentPromises = logFiles
        .filter((file) => file.includes(targetDate))
        .map((file) => fs.readFile(path.join(LOG_DIR, file), "utf8"));

      const logContents = await Promise.all(logContentPromises);

      const logEntries: LogEntry[] = logContents.flatMap((content) =>
        content
          .split("\n")
          .filter((line) => line)
          .map((line) => {
            const [timestamp, rest] = line.split(" [");
            const [level, ...messageParts] = rest.split("]: ");
            const message = messageParts.join("]: ");

            // Attempt to parse metadata if present
            let metadata;
            const metadataIndex = message.lastIndexOf(" {");
            if (metadataIndex !== -1) {
              metadata = JSON.parse(message.substring(metadataIndex + 1));
              return {
                timestamp,
                level,
                message: message.substring(0, metadataIndex).trim(),
                metadata,
              };
            }
            return { timestamp, level, message };
          })
      );

      return logEntries;
    } catch (error) {
      throw error;
    }
  },
};
