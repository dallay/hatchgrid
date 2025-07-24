// Test file to verify built package exports work correctly
import {
	ConsoleTransport,
	createLoggerName,
	LOG_LEVEL_NAMES,
	Logger,
	LogLevel,
	LogManager,
} from "./dist/logger.js";

// Test that all exports are available from the built package
const testBuiltExports = () => {
	console.log("Testing built package exports...");

	// Test LogLevel enum
	console.log("LogLevel.INFO:", LogLevel.INFO);
	console.log("LOG_LEVEL_NAMES:", LOG_LEVEL_NAMES);

	// Test LogManager
	const transport = new ConsoleTransport();
	LogManager.configure({
		level: LogLevel.INFO,
		transports: [transport],
	});

	// Test Logger
	const logger = LogManager.getLogger("test.built.exports");
	logger.info("Built package exports are working correctly!");

	// Test utility functions
	const loggerName = createLoggerName("test.logger");
	console.log("Created logger name:", loggerName);

	console.log("✅ All built package exports are working correctly!");
};

testBuiltExports();
