import fs from "fs-extra";
import path from "path";

const LOG_DIR = path.join(__dirname, "../../../logs");

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  tag?: string;
  location?: string;
  error?: string;
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
          .filter((line) => line.trim())
          .map((line) => {
            const logEntry: LogEntry = {
              timestamp: "",
              level: "",
              message: "",
            };

            // Extract timestamp
            const timestampEndIndex = line.indexOf(" [");
            if (timestampEndIndex === -1) {
              console.error("Invalid log format:", line);
              return null;
            }
            logEntry.timestamp = line.substring(0, timestampEndIndex).trim();

            // Extract level
            const levelStartIndex = timestampEndIndex + 2;
            const levelEndIndex = line.indexOf("]: ", levelStartIndex);
            if (levelEndIndex === -1) {
              console.error("Invalid log format:", line);
              return null;
            }
            logEntry.level = line
              .substring(levelStartIndex, levelEndIndex)
              .trim();

            // Extract message and metadata
            const messageStartIndex = levelEndIndex + 3;
            const messageEndIndex = line.indexOf(" [tag: ", messageStartIndex);
            logEntry.message =
              messageEndIndex === -1
                ? line.substring(messageStartIndex).trim()
                : line.substring(messageStartIndex, messageEndIndex).trim();

            // Extract optional fields (tag, location, error)
            const tagMatch = line.match(/\[tag: (.*?)\]/);
            if (tagMatch) logEntry.tag = tagMatch[1];

            const locationMatch = line.match(/\[location: (.*?)\]/);
            if (locationMatch) logEntry.location = locationMatch[1];

            const errorMatch = line.match(/\[error: (.*?)\]/);
            if (errorMatch) logEntry.error = errorMatch[1];

            return logEntry;
          })
      );

      return logEntries.filter((entry): entry is LogEntry => entry !== null);
    } catch (error) {
      console.error("Error reading log files:", error);
      throw error;
    }
  },
};

export default logsServices;
