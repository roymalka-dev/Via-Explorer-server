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

      const logEntries: LogEntry[] = logContents.flatMap(
        (content) =>
          content
            .split("\n")
            .filter((line) => line.trim()) // Ensure we are not processing empty lines
            .map((line) => {
              try {
                const [timestamp, rest] = line.split(" [");
                if (!rest) {
                  // If the log line doesn't contain expected format, skip it
                  return null;
                }
                const [level, ...messageParts] = rest.split("]: ");
                if (!messageParts.length) {
                  // If the log line doesn't contain expected format, skip it
                  return null;
                }
                const message = messageParts.join("]: ");

                // Attempt to parse metadata if present
                let metadata;
                const metadataMatch = message.match(/({.*})$/);
                if (metadataMatch) {
                  const metadataString = metadataMatch[1];
                  try {
                    metadata = JSON.parse(metadataString);
                    return {
                      timestamp,
                      level,
                      message: message.replace(metadataString, "").trim(),
                      metadata,
                    };
                  } catch (jsonError) {
                    console.error("Failed to parse metadata:", jsonError);
                    // Optionally log the error and continue without metadata
                  }
                }
                return { timestamp, level, message };
              } catch (err) {
                console.error("Error processing line:", line, err);
                return null;
              }
            })
            .filter((entry) => entry !== null) // Filter out null entries
      );

      return logEntries;
    } catch (error) {
      throw error;
    }
  },
};
