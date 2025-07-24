import type { LoggerConfiguration, LogLevel, Transport } from "./types";
import {
	LoggerConfigurationError,
	LoggerErrorType,
	LogLevel as LogLevelEnum,
} from "./types.ts";

/**
 * Validates logger configuration objects
 */
export class ConfigurationValidator {
	/**
	 * Validate a complete logger configuration
	 */
	static validate(config: LoggerConfiguration): void {
		ConfigurationValidator.validateConfigExists(config);
		ConfigurationValidator.validateTransports(config.transports);
		ConfigurationValidator.validateRootLevel(config.level);
		ConfigurationValidator.validateHierarchicalLevels(config.levels);
	}

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

	private static validateRootLevel(level: LogLevel): void {
		if (!ConfigurationValidator.isValidLogLevel(level)) {
			throw new LoggerConfigurationError(
				LoggerErrorType.LEVEL_INVALID,
				`Invalid root log level: ${level}`,
			);
		}
	}

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
