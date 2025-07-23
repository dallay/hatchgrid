// Export Logger class and LogManager singleton
export { Logger } from "./Logger.js";
export { LogManager } from "./LogManager.js";

// Export types for public API
export type {
	LogEntry,
	LoggerConfiguration,
	LogLevel,
	LogMethod,
	Transport,
} from "./types.js";
export {
	createLoggerName,
	LOG_LEVEL_NAMES,
	LogLevel as LogLevelEnum,
} from "./types.js";
