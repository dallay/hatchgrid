import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "./Logger.js";
import { type LogEntry, LogLevel } from "./types.js";

describe("Logger", () => {
	let logger: Logger;
	let mockProcessLogEntry: any;

	beforeEach(() => {
		logger = new Logger("test.logger");
		// Mock the private processLogEntry method
		mockProcessLogEntry = vi
			.spyOn(logger as any, "processLogEntry")
			.mockImplementation(() => {});
	});

	describe("constructor", () => {
		it("should create logger with immutable name property", () => {
			const loggerName = "api.services.auth";
			const testLogger = new Logger(loggerName);

			expect(testLogger.name).toBe(loggerName);

			// Verify name property is defined and has correct type
			expect(typeof testLogger.name).toBe("string");

			// The readonly modifier is enforced at compile time by TypeScript
			// This ensures the property cannot be reassigned in TypeScript code
		});
	});

	describe("log level methods", () => {
		it("should have trace method that accepts message and args", () => {
			const message = "trace message";
			const args = ["arg1", { key: "value" }, 123];

			logger.trace(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.TRACE,
				loggerName: logger.name,
				message,
				args,
			});
		});

		it("should have debug method that accepts message and args", () => {
			const message = "debug message";
			const args = ["arg1", { key: "value" }];

			logger.debug(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.DEBUG,
				loggerName: logger.name,
				message,
				args,
			});
		});

		it("should have info method that accepts message and args", () => {
			const message = "info message";
			const args = [42];

			logger.info(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.INFO,
				loggerName: logger.name,
				message,
				args,
			});
		});

		it("should have warn method that accepts message and args", () => {
			const message = "warn message";
			const args = [];

			logger.warn(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.WARN,
				loggerName: logger.name,
				message,
				args,
			});
		});

		it("should have error method that accepts message and args", () => {
			const message = "error message";
			const args = [new Error("test error")];

			logger.error(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.ERROR,
				loggerName: logger.name,
				message,
				args,
			});
		});

		it("should have fatal method that accepts message and args", () => {
			const message = "fatal message";
			const args = ["critical", "failure"];

			logger.fatal(message, ...args);

			expect(mockProcessLogEntry).toHaveBeenCalledWith({
				timestamp: expect.any(Date),
				level: LogLevel.FATAL,
				loggerName: logger.name,
				message,
				args,
			});
		});
	});

	describe("log method delegation", () => {
		it("should create LogEntry with correct timestamp", () => {
			const beforeTime = new Date();
			logger.info("test message");
			const afterTime = new Date();

			const logEntry = mockProcessLogEntry.mock.calls[0][0] as LogEntry;
			expect(logEntry.timestamp).toBeInstanceOf(Date);
			expect(logEntry.timestamp.getTime()).toBeGreaterThanOrEqual(
				beforeTime.getTime(),
			);
			expect(logEntry.timestamp.getTime()).toBeLessThanOrEqual(
				afterTime.getTime(),
			);
		});

		it("should create LogEntry with correct logger name", () => {
			const loggerName = "specific.logger.name";
			const specificLogger = new Logger(loggerName);
			const mockSpecificProcessLogEntry = vi
				.spyOn(specificLogger as any, "processLogEntry")
				.mockImplementation(() => {});

			specificLogger.info("test message");

			const logEntry = mockSpecificProcessLogEntry.mock.calls[0][0] as LogEntry;
			expect(logEntry.loggerName).toBe(loggerName);
		});

		it("should pass message and args correctly to LogEntry", () => {
			const message = "test message with args";
			const args = ["arg1", { complex: "object" }, 42, true];

			logger.debug(message, ...args);

			const logEntry = mockProcessLogEntry.mock.calls[0][0] as LogEntry;
			expect(logEntry.message).toBe(message);
			expect(logEntry.args).toEqual(args);
		});
	});

	describe("graceful degradation", () => {
		it("should not throw error when LogManager is not available", () => {
			// Create a new logger without mocking processLogEntry to test real behavior
			const realLogger = new Logger("real.logger");

			// This should not throw an error even though LogManager is not available
			expect(() => {
				realLogger.info("test message");
				realLogger.error("error message", new Error("test"));
				realLogger.debug("debug message", { data: "value" });
			}).not.toThrow();
		});
	});
});
