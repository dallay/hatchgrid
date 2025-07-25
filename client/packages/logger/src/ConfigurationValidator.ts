import type { LoggerConfiguration, LogLevel, Transport } from "./types";
import {
	LoggerConfigurationError,
	LoggerErrorType,
	LogLevel as LogLevelEnum,
} from "./types";

/**
 * Validates logger configuration objects to ensure they meet the required structure
 * and contain valid values for all properties.
 *
 * @remarks
 * This class provides static methods to validate logger configuration, transports, log levels, and hierarchical overrides.
 */
export class ConfigurationValidator {
	/**
	 * Validates a complete logger configuration object.
	 *
	 * @param config - The logger configuration to validate.
	 * @throws LoggerConfigurationError if the configuration is invalid.
	 */
	static validate(config: LoggerConfiguration): void {
		ConfigurationValidator.validateConfigExists(config);
		ConfigurationValidator.validateTransports(config.transports);
		ConfigurationValidator.validateRootLevel(config.level);
		ConfigurationValidator.validateHierarchicalLevels(config.levels);
	}

	/**
	 * Validates that the configuration object exists and is of the correct type.
	 *
	 * @param config - The configuration object to check.
	 * @throws LoggerConfigurationError if the configuration is null, undefined, or not an object.
	 */
	private static validateConfigExists(
		config: unknown,
	): asserts config is LoggerConfiguration {
		if (!config || typeof config !== "object") {
			throw new LoggerConfigurationError(
				LoggerErrorType.CONFIGURATION_INVALID,
				"LoggerConfiguration cannot be null or undefined",
			);
		}
	}

	/**
	 * Validates the transports array in the logger configuration.
	 *
	 * @param transports - The array of transport objects to validate.
	 * @throws LoggerConfigurationError if transports are missing, empty, or invalid.
	 */
	private static validateTransports(transports: readonly Transport[]): void {
		if (!Array.isArray(transports) || transports.length === 0) {
			throw new LoggerConfigurationError(
				LoggerErrorType.CONFIGURATION_INVALID,
				"LoggerConfiguration must have at least one transport",
			);
		}

		for (const [index, transport] of transports.entries()) {
			if (!transport || typeof transport.log !== "function") {
				throw new LoggerConfigurationError(
					LoggerErrorType.CONFIGURATION_INVALID,
					`Transport at index ${index} must have a log method`,
				);
			}
		}
	}

	/**
	 * Validates the root log level in the logger configuration.
	 *
	 * @param level - The root log level to validate.
	 * @throws LoggerConfigurationError if the log level is invalid.
	 */
	private static validateRootLevel(level: LogLevel): void {
		if (!ConfigurationValidator.isValidLogLevel(level)) {
			throw new LoggerConfigurationError(
				LoggerErrorType.LEVEL_INVALID,
				`Invalid root log level: ${level}`,
			);
		}
	}

	/**
	 * Validates hierarchical log level overrides in the logger configuration.
	 *
	 * @param levels - An optional record of logger names to log levels.
	 * @throws LoggerConfigurationError if any override log level is invalid.
	 */
	private static validateHierarchicalLevels(
		levels?: Record<string, LogLevel>,
	): void {
		if (!levels) return;

		for (const [name, level] of Object.entries(levels)) {
			if (!ConfigurationValidator.isValidLogLevel(level)) {
				throw new LoggerConfigurationError(
					LoggerErrorType.LEVEL_INVALID,
					`Invalid log level for '${name}': ${level}`,
				);
			}
		}
	}

	/**
	 * Checks if a value is a valid log level.
	 *
	 * @param level - The value to check.
	 * @returns True if the value is a valid LogLevel, false otherwise.
	 */
	private static isValidLogLevel(level: unknown): level is LogLevel {
		return (
			typeof level === "number" &&
			Number.isInteger(level) &&
			level >= LogLevelEnum.TRACE &&
			level <= LogLevelEnum.FATAL &&
			Object.values(LogLevelEnum).includes(level)
		);
	}
}
