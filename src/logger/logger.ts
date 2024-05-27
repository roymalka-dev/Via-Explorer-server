import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const logFormat = format.printf(({ timestamp, level, message, metadata }) => {
  let logMessage = `${timestamp} [${level}]: ${message}`;
  if (metadata && Object.keys(metadata).length) {
    if (metadata.tag) logMessage += ` [tag: ${metadata.tag}]`;
    if (metadata.location) logMessage += ` [location: ${metadata.location}]`;
    if (metadata.error) logMessage += ` [error: ${metadata.error}]`;
  }
  return logMessage;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    logFormat
  ),
  transports: [
    new transports.DailyRotateFile({
      dirname: "logs",
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Retain logs for 14 days
      level: "info",
    }),
    new transports.Console({
      level: "info",
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.metadata({
          fillExcept: ["message", "level", "timestamp", "label"],
        }),
        logFormat
      ),
    }),
  ],
});

export default logger;
