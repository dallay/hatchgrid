// @vitest-environment node
/**
 * Architecture isolation tests for the tags module
 * Verifies that clean architecture boundaries are maintained
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Get all TypeScript files in a directory recursively
 */
function getTypeScriptFiles(dir: string): string[] {
	const files: string[] = [];

	function traverse(currentDir: string) {
		const items = readdirSync(currentDir);

		for (const item of items) {
			const fullPath = join(currentDir, item);
			const stat = statSync(fullPath);

			if (
				stat.isDirectory() &&
				!item.startsWith(".") &&
				item !== "node_modules"
			) {
				traverse(fullPath);
			} else if (
				stat.isFile() &&
				(item.endsWith(".ts") || item.endsWith(".vue")) &&
				!item.endsWith(".test.ts") &&
				!item.endsWith(".spec.ts") &&
				!item.includes("test-utils.ts") &&
				!fullPath.includes("__tests__")
			) {
				files.push(fullPath);
			}
		}
	}

	traverse(dir);
	return files;
}

/**
 * Extract import statements from a file, including static, dynamic, and require imports.
 * For full reliability, consider using an AST parser.
 */
function extractImports(filePath: string): string[] {
	try {
		const content = readFileSync(filePath, "utf-8");
		const imports: string[] = [];

		// Static imports: import ... from '...' and import type ... from '...'
		const staticImportRegex =
			/import\s+(?:type\s+)?(?:(?:\{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
		let match = staticImportRegex.exec(content);
		while (match !== null) {
			imports.push(match[1]);
			match = staticImportRegex.exec(content);
		}

		// Dynamic imports: import('...')
		const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
		let dynMatch = dynamicImportRegex.exec(content);
		while (dynMatch !== null) {
			imports.push(dynMatch[1]);
			dynMatch = dynamicImportRegex.exec(content);
		}

		// require('...')
		const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
		let reqMatch = requireRegex.exec(content);
		while (reqMatch !== null) {
			imports.push(reqMatch[1]);
			reqMatch = requireRegex.exec(content);
		}

		return imports;
	} catch (error) {
		// Re-throw to make test failures more visible
		throw new Error(`Failed to read file ${filePath}: ${error}`);
	}
}

/**
 * Check if an import is a relative import to another layer
 */
function isRelativeImportToLayer(
	importPath: string,
	targetLayer: string,
): boolean {
	// Check for relative imports that go to another layer
	if (importPath.startsWith("../") || importPath.startsWith("./")) {
		// Normalize the path to check if it goes to the target layer
		if (targetLayer === "infrastructure") {
			// For infrastructure, also check for imports to specific infra subdirectories
			return (
				importPath.includes(`/${targetLayer}/`) ||
				importPath.includes(`../${targetLayer}`) ||
				importPath.includes("../api/") ||
				importPath.includes("../store/") ||
				importPath.includes("../views/") ||
				importPath.includes("../di/")
			);
		}
		if (targetLayer === "application") {
			// For application, check for composables and application directories
			return (
				importPath.includes(`/${targetLayer}/`) ||
				importPath.includes(`../${targetLayer}`) ||
				importPath.includes("../composables/") ||
				importPath.includes("../application/")
			);
		}
		if (targetLayer === "presentation") {
			// For presentation, check for views and components
			return (
				importPath.includes(`/${targetLayer}/`) ||
				importPath.includes(`../${targetLayer}`) ||
				importPath.includes("../views/") ||
				importPath.includes("../components/")
			);
		}
		return (
			importPath.includes(`/${targetLayer}/`) ||
			importPath.includes(`../${targetLayer}`)
		);
	}
	return false;
}

/**
 * Check if an import is an absolute import to another layer within the same module
 */
function isAbsoluteImportToLayer(
	importPath: string,
	targetLayer: string,
): boolean {
	// Check for absolute imports within the tag module
	if (targetLayer === "infrastructure") {
		// Infrastructure includes api, store, views, and di subdirectories
		return (
			importPath.includes(`/tag/${targetLayer}/`) ||
			importPath.includes(`@/tag/${targetLayer}/`) ||
			importPath.includes("/tag/api/") ||
			importPath.includes("@/tag/api/") ||
			importPath.includes("/tag/store/") ||
			importPath.includes("@/tag/store/") ||
			importPath.includes("/tag/views/") ||
			importPath.includes("@/tag/views/") ||
			importPath.includes("/tag/di/") ||
			importPath.includes("@/tag/di/")
		);
	}
	if (targetLayer === "application") {
		// Application includes composables and application directories
		return (
			importPath.includes(`/tag/${targetLayer}/`) ||
			importPath.includes(`@/tag/${targetLayer}/`) ||
			importPath.includes("/tag/composables/") ||
			importPath.includes("@/tag/composables/")
		);
	}
	if (targetLayer === "presentation") {
		// Presentation includes views and components
		return (
			importPath.includes(`/tag/${targetLayer}/`) ||
			importPath.includes(`@/tag/${targetLayer}/`) ||
			importPath.includes("/tag/views/") ||
			importPath.includes("@/tag/views/") ||
			importPath.includes("/tag/components/") ||
			importPath.includes("@/tag/components/")
		);
	}
	return (
		importPath.includes(`/tag/${targetLayer}/`) ||
		importPath.includes(`@/tag/${targetLayer}/`)
	);
}

/**
 * Determine the layer of a file based on its path
 */
function getFileLayer(filePath: string): string | null {
	if (filePath.includes("/domain/")) return "domain";
	if (filePath.includes("/infrastructure/")) {
		// Vue files in infrastructure/views are actually presentation layer
		if (filePath.includes("/views/") && filePath.endsWith(".vue")) {
			return "presentation";
		}
		return "infrastructure";
	}
	if (filePath.includes("/presentation/")) return "presentation";
	if (filePath.includes("/application/")) return "application";
	if (filePath.includes("/store/")) return "store";
	if (filePath.includes("/di/")) return "di";
	if (filePath.includes("/composables/")) return "application"; // Composables are application layer
	if (filePath.includes("/api/")) return "infrastructure"; // API is part of infrastructure
	if (filePath.includes("/views/")) return "presentation"; // Views are presentation layer
	if (filePath.includes("/components/")) return "presentation"; // Components are presentation layer
	return null;
}

describe("Architecture Isolation", () => {
	const tagDir = join(__dirname, "..");
	const allFiles = getTypeScriptFiles(tagDir);

	describe("Domain Layer Isolation", () => {
		it("should not import from infrastructure layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "infrastructure") ||
						isAbsoluteImportToLayer(importPath, "infrastructure")
					) {
						violations.push(
							`${file} imports from infrastructure: ${importPath}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from presentation layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "presentation") ||
						isAbsoluteImportToLayer(importPath, "presentation")
					) {
						violations.push(`${file} imports from presentation: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from store layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "store") ||
						isAbsoluteImportToLayer(importPath, "store")
					) {
						violations.push(`${file} imports from store: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from DI layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "di") ||
						isAbsoluteImportToLayer(importPath, "di")
					) {
						violations.push(`${file} imports from DI: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from application layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "application") ||
						isAbsoluteImportToLayer(importPath, "application")
					) {
						violations.push(`${file} imports from application: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should only import from external libraries and other domain files", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const allowedPatterns = [
				// External libraries
				/^[a-z]/, // npm packages
				// Internal domain imports
				/^\.\.?\//, // relative imports within domain
			];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					// Skip if it's an allowed pattern
					if (allowedPatterns.some((pattern) => pattern.test(importPath))) {
						continue;
					}

					// Check if it's importing from other layers (should not happen)
					const isFromOtherLayer = [
						"infrastructure",
						"presentation",
						"store",
						"di",
						"application",
						"composables",
					].some((layer) => isAbsoluteImportToLayer(importPath, layer));

					if (isFromOtherLayer) {
						expect(false).toBe(true);
						expect.fail(
							`Domain file ${file} has forbidden import: ${importPath}`,
						);
					}
				}
			}
		});
	});

	describe("Application Layer Isolation", () => {
		it("should not import from infrastructure layer", () => {
			const applicationFiles = allFiles.filter((file) =>
				file.includes("/application/"),
			);
			const violations: string[] = [];

			for (const file of applicationFiles) {
				// Skip providers - they can define types based on infrastructure for dependency injection
				if (file.includes("/providers/")) {
					continue;
				}

				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "infrastructure") ||
						isAbsoluteImportToLayer(importPath, "infrastructure")
					) {
						violations.push(
							`${file} imports from infrastructure: ${importPath}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from presentation layer", () => {
			const applicationFiles = allFiles.filter((file) =>
				file.includes("/application/"),
			);
			const violations: string[] = [];

			for (const file of applicationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "presentation") ||
						isAbsoluteImportToLayer(importPath, "presentation")
					) {
						violations.push(`${file} imports from presentation: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from store layer", () => {
			const applicationFiles = allFiles.filter((file) =>
				file.includes("/application/"),
			);
			const violations: string[] = [];

			for (const file of applicationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "store") ||
						isAbsoluteImportToLayer(importPath, "store")
					) {
						violations.push(`${file} imports from store: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should be able to import from domain layer", () => {
			const applicationFiles = allFiles.filter((file) =>
				file.includes("/application/"),
			);
			let hasDomainImports = false;

			for (const file of applicationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "domain") ||
						isAbsoluteImportToLayer(importPath, "domain") ||
						importPath.includes("../domain/") ||
						importPath.includes("../../domain/")
					) {
						hasDomainImports = true;
						break;
					}
				}

				if (hasDomainImports) break;
			}

			// Application should import from domain (this is expected and correct)
			expect(hasDomainImports).toBe(true);
		});
	});

	describe("Infrastructure Layer Isolation", () => {
		it("should not import from presentation layer", () => {
			const infrastructureFiles = allFiles.filter(
				(file) =>
					file.includes("/infrastructure/") && !file.includes("/views/"),
			);
			const violations: string[] = [];

			for (const file of infrastructureFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "presentation") ||
						isAbsoluteImportToLayer(importPath, "presentation")
					) {
						violations.push(`${file} imports from presentation: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from application layer", () => {
			const infrastructureFiles = allFiles.filter(
				(file) =>
					file.includes("/infrastructure/") && !file.includes("/views/"),
			);
			const violations: string[] = [];

			for (const file of infrastructureFiles) {
				// Skip service implementations - they can implement application interfaces
				if (file.includes("/services/") && file.endsWith("Impl.ts")) {
					continue;
				}
				// Skip service providers - they can implement application interfaces
				if (file.includes("/services/") && file.includes("Provider.ts")) {
					continue;
				}

				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "application") ||
						isAbsoluteImportToLayer(importPath, "application")
					) {
						violations.push(`${file} imports from application: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should be able to import from domain layer", () => {
			const infrastructureFiles = allFiles.filter((file) =>
				file.includes("/infrastructure/"),
			);
			let hasDomainImports = false;

			for (const file of infrastructureFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "domain") ||
						isAbsoluteImportToLayer(importPath, "domain") ||
						importPath.includes("../domain/") ||
						importPath.includes("../../domain/")
					) {
						hasDomainImports = true;
						break;
					}
				}

				if (hasDomainImports) break;
			}

			// Infrastructure should import from domain (this is expected and correct)
			expect(hasDomainImports).toBe(true);
		});
	});

	describe("Presentation Layer Isolation", () => {
		it("should not import from infrastructure layer directly", () => {
			const presentationFiles = allFiles.filter(
				(file) => file.includes("/views/") && file.endsWith(".vue"),
			);
			const violations: string[] = [];

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					// Allow imports from infrastructure/views (same layer) but not other infrastructure
					if (
						(isRelativeImportToLayer(importPath, "infrastructure") ||
							isAbsoluteImportToLayer(importPath, "infrastructure")) &&
						!importPath.includes("/views/") &&
						!importPath.includes("../views/")
					) {
						violations.push(
							`${file} imports from infrastructure: ${importPath}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from domain use cases directly", () => {
			const presentationFiles = allFiles.filter(
				(file) => file.includes("/views/") && file.endsWith(".vue"),
			);
			const violations: string[] = [];

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					// Check for direct imports from domain/usecases
					if (
						importPath.includes("/domain/usecases/") ||
						importPath.includes("../domain/usecases") ||
						importPath.includes("../../domain/usecases") ||
						importPath.includes("../../../domain/usecases")
					) {
						violations.push(
							`${file} imports directly from domain use cases: ${importPath}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should be able to import domain models for typing", () => {
			const presentationFiles = allFiles.filter(
				(file) => file.includes("/views/") && file.endsWith(".vue"),
			);
			let hasDomainModelImports = false;

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						importPath.includes("/domain/models/") ||
						importPath.includes("../domain/models") ||
						importPath.includes("../../domain/models") ||
						importPath.includes("../../../domain/models")
					) {
						hasDomainModelImports = true;
						break;
					}
				}

				if (hasDomainModelImports) break;
			}

			// Presentation should be able to import domain models for typing
			expect(hasDomainModelImports).toBe(true);
		});

		it("should be able to import from application layer (composables)", () => {
			const presentationFiles = allFiles.filter(
				(file) => file.includes("/views/") && file.endsWith(".vue"),
			);
			let hasApplicationImports = false;

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						importPath.includes("/application/") ||
						importPath.includes("../application/") ||
						importPath.includes("../../application/") ||
						importPath.includes("../../../application/")
					) {
						hasApplicationImports = true;
						break;
					}
				}

				if (hasApplicationImports) break;
			}

			// Presentation should be able to import from application layer (composables)
			expect(hasApplicationImports).toBe(true);
		});
	});

	describe("Store Layer Isolation", () => {
		it("should not import from presentation layer", () => {
			const storeFiles = allFiles.filter((file) => file.includes("/store/"));
			const violations: string[] = [];

			for (const file of storeFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "presentation") ||
						isAbsoluteImportToLayer(importPath, "presentation")
					) {
						violations.push(`${file} imports from presentation: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from infrastructure layer directly", () => {
			const storeFiles = allFiles.filter((file) => file.includes("/store/"));
			const violations: string[] = [];

			for (const file of storeFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					// Store should not import from infrastructure except through DI
					if (
						(isRelativeImportToLayer(importPath, "infrastructure") ||
							isAbsoluteImportToLayer(importPath, "infrastructure")) &&
						!importPath.includes("/di/") &&
						!importPath.includes("../di/")
					) {
						violations.push(
							`${file} imports from infrastructure: ${importPath}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not import from application layer", () => {
			const storeFiles = allFiles.filter((file) => file.includes("/store/"));
			const violations: string[] = [];

			for (const file of storeFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "application") ||
						isAbsoluteImportToLayer(importPath, "application")
					) {
						violations.push(`${file} imports from application: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should be able to import from domain layer for models and use cases", () => {
			const storeFiles = allFiles.filter((file) => file.includes("/store/"));
			let hasDomainImports = false;

			for (const file of storeFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						importPath.includes("/domain/") ||
						importPath.includes("../domain/") ||
						importPath.includes("../../domain/")
					) {
						hasDomainImports = true;
						break;
					}
				}

				if (hasDomainImports) break;
			}

			// Store should import from domain (this is expected and correct)
			expect(hasDomainImports).toBe(true);
		});
	});

	describe("Dependency Injection Layer", () => {
		it("should be able to import from all layers for wiring", () => {
			const diFiles = allFiles.filter((file) => file.includes("/di/"));
			const layersImported = new Set<string>();

			for (const file of diFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						importPath.includes("/domain/") ||
						importPath.includes("../domain/") ||
						importPath.includes("../../domain/")
					) {
						layersImported.add("domain");
					}
					if (
						importPath.includes("/infrastructure/") ||
						importPath.includes("../infrastructure/") ||
						importPath.includes("../api/")
					) {
						layersImported.add("infrastructure");
					}
					if (
						importPath.includes("/store/") ||
						importPath.includes("../store/")
					) {
						layersImported.add("store");
					}
				}
			}

			// DI should import from domain and infrastructure at minimum
			expect(layersImported.has("domain")).toBe(true);
			expect(layersImported.has("infrastructure")).toBe(true);
		});

		it("should not be imported by domain layer", () => {
			const domainFiles = allFiles.filter((file) => file.includes("/domain/"));
			const violations: string[] = [];

			for (const file of domainFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "di") ||
						isAbsoluteImportToLayer(importPath, "di")
					) {
						violations.push(`${file} imports from DI: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});

		it("should not be imported by application layer", () => {
			const applicationFiles = allFiles.filter((file) =>
				file.includes("/application/"),
			);
			const violations: string[] = [];

			for (const file of applicationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "di") ||
						isAbsoluteImportToLayer(importPath, "di")
					) {
						violations.push(`${file} imports from DI: ${importPath}`);
					}
				}
			}

			expect(violations).toEqual([]);
		});
	});

	describe("Overall Architecture Compliance", () => {
		it("should have proper layer dependency direction", () => {
			// This test verifies the overall dependency flow:
			// Presentation -> Application -> Domain <- Infrastructure
			//                   ^                ^
			//                   |                |
			//                 Store              |
			//                   ^                |
			//                   |                |
			//                   +--------DI------+

			const layerFiles = {
				domain: allFiles.filter((file) => file.includes("/domain/")),
				application: allFiles.filter((file) => file.includes("/application/")),
				infrastructure: allFiles.filter(
					(file) =>
						file.includes("/infrastructure/") && !file.includes("/views/"),
				),
				presentation: allFiles.filter(
					(file) => file.includes("/views/") && file.endsWith(".vue"),
				),
				store: allFiles.filter((file) => file.includes("/store/")),
				di: allFiles.filter((file) => file.includes("/di/")),
			};

			// Domain should not import from any other layer
			for (const file of layerFiles.domain) {
				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["infrastructure", "presentation", "store", "di", "application"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
				);
				expect(invalidImports).toEqual([]);
			}

			// Application can import from domain and infrastructure (providers only)
			for (const file of layerFiles.application) {
				// Skip providers - they can import from infrastructure
				if (file.includes("/providers/")) {
					continue;
				}

				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["infrastructure", "presentation", "store"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
				);
				expect(invalidImports).toEqual([]);
			}

			// Infrastructure can import from domain, application (service implementations), and store
			for (const file of layerFiles.infrastructure) {
				// Skip service implementations - they can import from application
				if (
					file.includes("/services/") &&
					(file.endsWith("Impl.ts") || file.includes("Provider.ts"))
				) {
					continue;
				}

				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["presentation"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
				);
				expect(invalidImports).toEqual([]);
			}

			// Presentation should not import from infrastructure (except views) or use cases directly
			for (const file of layerFiles.presentation) {
				const imports = extractImports(file);
				const invalidImports = imports.filter(
					(imp) =>
						((isAbsoluteImportToLayer(imp, "infrastructure") ||
							isRelativeImportToLayer(imp, "infrastructure")) &&
							!imp.includes("/views/") &&
							!imp.includes("../views/")) ||
						imp.includes("/domain/usecases/"),
				);
				expect(invalidImports).toEqual([]);
			}

			// Store should not import from presentation, infrastructure (except DI), or application
			for (const file of layerFiles.store) {
				const imports = extractImports(file);
				const invalidImports = imports.filter(
					(imp) =>
						["presentation", "application"].some(
							(layer) =>
								isAbsoluteImportToLayer(imp, layer) ||
								isRelativeImportToLayer(imp, layer),
						) ||
						((isAbsoluteImportToLayer(imp, "infrastructure") ||
							isRelativeImportToLayer(imp, "infrastructure")) &&
							!imp.includes("/di/") &&
							!imp.includes("../di/")),
				);
				expect(invalidImports).toEqual([]);
			}
		});

		it("should have no circular dependencies between layers", () => {
			// This is a simplified check - in a real scenario you'd want a more sophisticated
			// circular dependency detection algorithm

			const layerDependencies: Record<string, Set<string>> = {
				domain: new Set(),
				application: new Set(),
				infrastructure: new Set(),
				presentation: new Set(),
				store: new Set(),
				di: new Set(),
			};

			// Analyze dependencies for each layer
			for (const file of allFiles) {
				const layer = getFileLayer(file);
				if (!layer || !layerDependencies[layer]) continue;

				const imports = extractImports(file);
				for (const importPath of imports) {
					for (const targetLayer of Object.keys(layerDependencies)) {
						if (
							targetLayer !== layer &&
							(isAbsoluteImportToLayer(importPath, targetLayer) ||
								isRelativeImportToLayer(importPath, targetLayer) ||
								(importPath.includes("../domain/") &&
									targetLayer === "domain") ||
								(importPath.includes("../../domain/") &&
									targetLayer === "domain") ||
								(importPath.includes("../infrastructure/") &&
									targetLayer === "infrastructure") ||
								(importPath.includes("../application/") &&
									targetLayer === "application"))
						) {
							layerDependencies[layer].add(targetLayer);
						}
					}
				}
			}

			// Check for circular dependencies (allow service pattern)
			// Domain should not depend on anything
			expect(Array.from(layerDependencies.domain)).toEqual([]);

			// Application should only depend on domain (allow infrastructure imports for providers)
			const appDeps = Array.from(layerDependencies.application).filter(
				(dep) => dep !== "infrastructure",
			);
			expect(appDeps.every((dep) => dep === "domain")).toBe(true);

			// Infrastructure can depend on domain, application (for service implementations), store, and di (for wiring)
			const infraDeps = Array.from(layerDependencies.infrastructure);
			expect(
				infraDeps.every(
					(dep) =>
						dep === "domain" ||
						dep === "application" ||
						dep === "store" ||
						dep === "di",
				),
			).toBe(true);

			// Presentation should not depend on infrastructure (except views)
			expect(layerDependencies.presentation.has("infrastructure")).toBe(false);

			// Store should not depend on presentation, infrastructure (except DI), or application
			expect(layerDependencies.store.has("presentation")).toBe(false);
			expect(layerDependencies.store.has("application")).toBe(false);
		});

		it("should maintain consistent module structure", () => {
			// Verify that the tag module follows the expected structure
			const expectedDirectories = [
				"domain",
				"application",
				"infrastructure",
				"__tests__",
			];

			const tagDir = join(__dirname, "..");
			const directories = readdirSync(tagDir).filter((item) => {
				const fullPath = join(tagDir, item);
				return statSync(fullPath).isDirectory();
			});

			for (const expectedDir of expectedDirectories) {
				expect(directories).toContain(expectedDir);
			}

			// Verify domain structure
			const domainDir = join(tagDir, "domain");
			const domainSubdirs = readdirSync(domainDir).filter((item) => {
				const fullPath = join(domainDir, item);
				return statSync(fullPath).isDirectory();
			});

			expect(domainSubdirs).toContain("models");
			expect(domainSubdirs).toContain("repositories");
			expect(domainSubdirs).toContain("usecases");

			// Verify infrastructure structure
			const infraDir = join(tagDir, "infrastructure");
			const infraSubdirs = readdirSync(infraDir).filter((item) => {
				const fullPath = join(infraDir, item);
				return statSync(fullPath).isDirectory();
			});

			expect(infraSubdirs).toContain("api");
			expect(infraSubdirs).toContain("di");
			expect(infraSubdirs).toContain("store");
			expect(infraSubdirs).toContain("views");
		});
	});
});
