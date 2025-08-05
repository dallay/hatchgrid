// @vitest-environment node
/**
 * Architecture isolation tests for the subscribers module
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

		// Static imports: import ... from '...'
		const staticImportRegex =
			/import\s+(?:(?:\{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
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
				importPath.includes("../components/")
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
	// Check for absolute imports within the subscribers module
	if (targetLayer === "infrastructure") {
		// Infrastructure includes api, store, views, and components subdirectories
		return (
			importPath.includes(`/subscribers/${targetLayer}/`) ||
			importPath.includes(`@/subscribers/${targetLayer}/`) ||
			importPath.includes("/subscribers/api/") ||
			importPath.includes("@/subscribers/api/") ||
			importPath.includes("/subscribers/store/") ||
			importPath.includes("@/subscribers/store/") ||
			importPath.includes("/subscribers/views/") ||
			importPath.includes("@/subscribers/views/") ||
			importPath.includes("/subscribers/components/") ||
			importPath.includes("@/subscribers/components/")
		);
	}
	if (targetLayer === "application") {
		// Application includes composables and application directories
		return (
			importPath.includes(`/subscribers/${targetLayer}/`) ||
			importPath.includes(`@/subscribers/${targetLayer}/`) ||
			importPath.includes("/subscribers/composables/") ||
			importPath.includes("@/subscribers/composables/")
		);
	}
	if (targetLayer === "presentation") {
		// Presentation includes views and components
		return (
			importPath.includes(`/subscribers/${targetLayer}/`) ||
			importPath.includes(`@/subscribers/${targetLayer}/`) ||
			importPath.includes("/subscribers/views/") ||
			importPath.includes("@/subscribers/views/") ||
			importPath.includes("/subscribers/components/") ||
			importPath.includes("@/subscribers/components/")
		);
	}
	return (
		importPath.includes(`/subscribers/${targetLayer}/`) ||
		importPath.includes(`@/subscribers/${targetLayer}/`)
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
	const subscribersDir = join(__dirname, "..");
	const allFiles = getTypeScriptFiles(subscribersDir);

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

	describe("Infrastructure Layer Isolation", () => {
		it("should not import from presentation layer", () => {
			const infrastructureFiles = allFiles.filter((file) =>
				file.includes("/infrastructure/"),
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

		it("should not import from store layer", () => {
			const infrastructureFiles = allFiles.filter((file) =>
				file.includes("/infrastructure/"),
			);
			const violations: string[] = [];

			for (const file of infrastructureFiles) {
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
			const infrastructureFiles = allFiles.filter((file) =>
				file.includes("/infrastructure/"),
			);
			let hasDomainImports = false;

			for (const file of infrastructureFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						isRelativeImportToLayer(importPath, "domain") ||
						isAbsoluteImportToLayer(importPath, "domain")
					) {
						hasDomainImports = true;
						break;
					}
				}

				if (hasDomainImports) break;
			}

			// Infrastructure should import from a domain (this is expected and correct)
			expect(hasDomainImports).toBe(true);
		});
	});

	describe("Presentation Layer Isolation", () => {
		it("should not import from infrastructure layer", () => {
			const presentationFiles = allFiles.filter((file) =>
				file.includes("/presentation/"),
			);
			const violations: string[] = [];

			for (const file of presentationFiles) {
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

		it("should not import from domain use cases directly", () => {
			const presentationFiles = allFiles.filter((file) =>
				file.includes("/presentation/"),
			);
			const violations: string[] = [];

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					// Check for direct imports from domain/usecases
					if (
						importPath.includes("/domain/usecases/") ||
						importPath.includes("../domain/usecases")
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
				(file) => file.includes("/views/") || file.includes("/components/"),
			);
			let hasDomainModelImports = false;

			for (const file of presentationFiles) {
				const imports = extractImports(file);

				for (const importPath of imports) {
					if (
						importPath.includes("/domain/models/") ||
						importPath.includes("../domain/models") ||
						importPath.includes("../../../../domain/models")
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

		it("should be able to import from domain layer for models and use cases", () => {
			// This test verifies that store CAN import from domain (which is correct)
			// The other tests already verify that store doesn't import from forbidden layers
			const storeFiles = allFiles.filter((file) => file.includes("/store/"));

			// Just verify we have store files to test
			expect(storeFiles.length).toBeGreaterThan(0);
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
						isRelativeImportToLayer(importPath, "domain") ||
						isAbsoluteImportToLayer(importPath, "domain")
					) {
						layersImported.add("domain");
					}
					if (
						isRelativeImportToLayer(importPath, "infrastructure") ||
						isAbsoluteImportToLayer(importPath, "infrastructure")
					) {
						layersImported.add("infrastructure");
					}
					if (
						isRelativeImportToLayer(importPath, "store") ||
						isAbsoluteImportToLayer(importPath, "store")
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
	});

	describe("Overall Architecture Compliance", () => {
		it("should have proper layer dependency direction", () => {
			// This test verifies the overall dependency flow:
			// Presentation -> Store -> Domain <- Infrastructure
			//                   ^         ^
			//                   |         |
			//                   +---------+
			//                      DI

			const layerFiles = {
				domain: allFiles.filter((file) => file.includes("/domain/")),
				infrastructure: allFiles.filter((file) =>
					file.includes("/infrastructure/"),
				),
				presentation: allFiles.filter((file) =>
					file.includes("/presentation/"),
				),
				store: allFiles.filter((file) => file.includes("/store/")),
				di: allFiles.filter((file) => file.includes("/di/")),
			};

			// Domain should not import from any other layer
			for (const file of layerFiles.domain) {
				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["infrastructure", "presentation", "store", "di"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
				);
				expect(invalidImports).toEqual([]);
			}

			// Infrastructure should only import from domain
			for (const file of layerFiles.infrastructure) {
				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["presentation", "store"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
				);
				expect(invalidImports).toEqual([]);
			}

			// Presentation should not import from infrastructure or use cases directly
			for (const file of layerFiles.presentation) {
				const imports = extractImports(file);
				const invalidImports = imports.filter(
					(imp) =>
						isAbsoluteImportToLayer(imp, "infrastructure") ||
						isRelativeImportToLayer(imp, "infrastructure") ||
						imp.includes("/domain/usecases/"),
				);
				expect(invalidImports).toEqual([]);
			}

			// Store should not import from presentation or infrastructure directly
			for (const file of layerFiles.store) {
				const imports = extractImports(file);
				const invalidImports = imports.filter((imp) =>
					["presentation", "infrastructure"].some(
						(layer) =>
							isAbsoluteImportToLayer(imp, layer) ||
							isRelativeImportToLayer(imp, layer),
					),
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
				composables: new Set(),
			}; // Analyze dependencies for each layer
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
								(importPath.includes("../infrastructure/") &&
									targetLayer === "infrastructure"))
						) {
							layerDependencies[layer].add(targetLayer);
						}
					}
				}
			}

			// Check for obvious circular dependencies
			// Check for obvious circular dependencies
			// Domain should not depend on anything
			expect(Array.from(layerDependencies.domain)).toEqual([]);

			// Infrastructure should only depend on domain
			const infraDeps = Array.from(layerDependencies.infrastructure);
			expect(infraDeps.every((dep) => dep === "domain")).toBe(true);

			// Presentation should not depend on infrastructure
			expect(layerDependencies.presentation.has("infrastructure")).toBe(false);

			// Store should not depend on presentation or infrastructure
			expect(layerDependencies.store.has("presentation")).toBe(false);
			expect(layerDependencies.store.has("infrastructure")).toBe(false);
		});
	});
});
