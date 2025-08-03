#!/usr/bin/env node

/**
 * Migration Validation Tool
 * Validates the hexagonal architecture migration process
 */

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
	success: boolean;
	message: string;
	details?: string[];
}

interface ValidationConfig {
	readonly command: string;
	readonly logMessage: string;
	readonly successMessage: string;
	readonly failureMessage: string;
}

interface MigrationValidation {
	buildValidation: ValidationResult;
	testValidation: ValidationResult;
	importValidation: ValidationResult;
	structureValidation: ValidationResult;
}

/**
 * Migration Validator
 *
 * Validates the hexagonal architecture migration by checking:
 * - Build process integrity
 * - Test suite execution
 * - Import statement correctness
 * - Project structure compliance
 */
class MigrationValidator {
	private readonly projectRoot: string;
	private readonly webAppPath: string;
	private readonly srcPath: string;

	// Expected project structure
	private static readonly EXPECTED_DIRECTORIES = [
		"components",
		"router",
		"stores",
		"services"
	] as const;

	private static readonly REQUIRED_FILES = [
		"main.ts"
	] as const;

	// Validation configurations
	private static readonly VALIDATION_CONFIGS: Record<string, ValidationConfig> = {
		build: {
			command: "pnpm build",
			logMessage: "Validating build process...",
			successMessage: "Build validation passed",
			failureMessage: "Build validation failed",
		},
		test: {
			command: "pnpm test --run",
			logMessage: "Validating test suite...",
			successMessage: "Test validation passed",
			failureMessage: "Test validation failed",
		},
		imports: {
			command: "pnpm check",
			logMessage: "Validating import statements...",
			successMessage: "Import validation passed",
			failureMessage: "Import validation failed - TypeScript compilation errors",
		},
	} as const;

	constructor() {
		this.projectRoot = join(__dirname, "..");
		this.webAppPath = join(this.projectRoot, "client/apps/web");
		this.srcPath = join(this.webAppPath, "src");
	}

	private log(
		level: "info" | "success" | "error" | "warning",
		message: string,
	): void {
		const colors = {
			info: "\x1b[36m",
			success: "\x1b[32m",
			error: "\x1b[31m",
			warning: "\x1b[33m",
		};
		const reset = "\x1b[0m";
		const icons = {
			info: "ℹ️ ",
			success: "✅",
			error: "❌",
			warning: "⚠️ ",
		};

		console.log(`${colors[level]}${icons[level]} ${message}${reset}`);
	}

	private async runCommand(
		command: string,
		cwd?: string,
	): Promise<{ success: boolean; output: string }> {
		try {
			const output = execSync(command, {
				cwd: cwd || this.webAppPath,
				encoding: "utf8",
				stdio: "pipe",
			});
			return { success: true, output };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, output: errorMessage };
		}
	}

	/**
	 * Executes a validation command and returns a structured result
	 */
	private executeValidationCommand(
		command: string,
		successMessage: string,
		failureMessage: string,
	): ValidationResult {
		try {
			execSync(command, {
				cwd: this.webAppPath,
				stdio: "pipe",
			});
			return {
				success: true,
				message: successMessage,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				success: false,
				message: failureMessage,
				details: [errorMessage],
			};
		}
	}

	private runValidation(configKey: keyof typeof MigrationValidator.VALIDATION_CONFIGS): ValidationResult {
		const config = MigrationValidator.VALIDATION_CONFIGS[configKey];
		this.log("info", config.logMessage);
		return this.executeValidationCommand(
			config.command,
			config.successMessage,
			config.failureMessage,
		);
	}

	private validateBuild(): ValidationResult {
		return this.runValidation("build");
	}

	private validateTests(): ValidationResult {
		return this.runValidation("test");
	}

	private validateImports(): ValidationResult {
		return this.runValidation("imports");
	}

	private validateStructure(): ValidationResult {
		this.log("info", "Validating project structure...");

		if (!existsSync(this.srcPath)) {
			return {
				success: false,
				message: "Source directory not found",
				details: [`${this.srcPath} does not exist`],
			};
		}

		const issues: string[] = [];

		// Check for expected directories
		const missingDirs = MigrationValidator.EXPECTED_DIRECTORIES.filter(
			(dir) => !existsSync(join(this.srcPath, dir)),
		);

		if (missingDirs.length > 0) {
			issues.push(`Missing directories: ${missingDirs.join(", ")}`);
		}

		// Check for required files
		const missingFiles = MigrationValidator.REQUIRED_FILES.filter(
			(file) => !existsSync(join(this.srcPath, file)),
		);

		if (missingFiles.length > 0) {
			issues.push(`Missing files: ${missingFiles.join(", ")}`);
		}

		return {
			success: issues.length === 0,
			message:
				issues.length === 0
					? "Structure validation passed"
					: "Structure validation failed",
			details: issues.length > 0 ? issues : undefined,
		};
	}

	private logResults(results: MigrationValidation): void {
		Object.entries(results).forEach(([key, result]) => {
			if (result.success) {
				this.log("success", result.message);
			} else {
				this.log("error", result.message);
				if (result.details) {
					result.details.forEach((detail) => {
						console.log(`  ${detail}`);
					});
				}
			}
		});
	}

	private logSummary(allPassed: boolean): void {
		if (allPassed) {
			this.log("success", "All migration validations passed! ✨");
		} else {
			this.log(
				"error",
				"Some migration validations failed. Please address the issues above.",
			);
		}
	}

	/**
	 * Runs all validation checks and returns comprehensive results
	 */
	public async validate(): Promise<MigrationValidation> {
		this.log("info", "Starting migration validation...");

		const results: MigrationValidation = {
			buildValidation: this.validateBuild(),
			testValidation: this.validateTests(),
			importValidation: this.validateImports(),
			structureValidation: this.validateStructure(),
		};

		this.logResults(results);

		const allPassed = Object.values(results).every((r) => r.success);
		this.logSummary(allPassed);

		return results;
	}
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const validator = new MigrationValidator();
	validator
		.validate()
		.then((results) => {
			const allPassed = Object.values(results).every((r) => r.success);
			process.exit(allPassed ? 0 : 1);
		})
		.catch((error) => {
			console.error("Validation failed:", error);
			process.exit(1);
		});
}

export { MigrationValidator, type ValidationResult, type MigrationValidation };
