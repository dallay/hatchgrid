#!/usr/bin/env node

/**
 * Dependency Analysis Tool
 * Analyzes the current codebase structure and dependencies for hexagonal architecture migration
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface FileInfo {
	path: string;
	relativePath: string;
	imports: string[];
	exports: string[];
	type: "vue" | "ts" | "js" | "other";
}

interface DependencyGraph {
	files: Map<string, FileInfo>;
	dependencies: Map<string, Set<string>>;
	dependents: Map<string, Set<string>>;
}

interface DomainAnalysis {
	authentication: string[];
	dashboard: string[];
	workspace: string[];
	subscribers: string[];
	shared: string[];
	unclassified: string[];
}

class DependencyAnalyzer {
	private projectRoot: string;
	private webAppPath: string;
	private srcPath: string;

	constructor() {
		this.projectRoot = join(__dirname, "..");
		this.webAppPath = join(this.projectRoot, "client/apps/web");
		this.srcPath = join(this.webAppPath, "src");
	}

	private log(message: string): void {
		console.log(`🔍 ${message}`);
	}

	private isRelevantFile(filePath: string): boolean {
		const ext = extname(filePath);
		return (
			[".vue", ".ts", ".js"].includes(ext) &&
			!filePath.includes("node_modules") &&
			!filePath.includes(".d.ts") &&
			!filePath.includes("test") &&
			!filePath.includes("spec")
		);
	}

	private getFileType(filePath: string): FileInfo["type"] {
		const ext = extname(filePath);
		switch (ext) {
			case ".vue":
				return "vue";
			case ".ts":
				return "ts";
			case ".js":
				return "js";
			default:
				return "other";
		}
	}

	private extractImports(content: string, filePath: string): string[] {
		const imports: string[] = [];

		// Match ES6 imports
		const importRegex =
			/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;

		let match;
		while ((match = importRegex.exec(content)) !== null) {
			const importPath = match[1];
			if (importPath.startsWith(".") || importPath.startsWith("@/")) {
				imports.push(importPath);
			}
		}

		// Match dynamic imports
		const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
		while ((match = dynamicImportRegex.exec(content)) !== null) {
			const importPath = match[1];
			if (importPath.startsWith(".") || importPath.startsWith("@/")) {
				imports.push(importPath);
			}
		}

		return imports;
	}

	private extractExports(content: string): string[] {
		const exports: string[] = [];

		// Match named exports
		const namedExportRegex =
			/export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
		let match;
		while ((match = namedExportRegex.exec(content)) !== null) {
			exports.push(match[1]);
		}

		// Match export { ... }
		const exportBlockRegex = /export\s*\{\s*([^}]+)\s*\}/g;
		while ((match = exportBlockRegex.exec(content)) !== null) {
			const exportList = match[1]
				.split(",")
				.map((e) => e.trim().split(" as ")[0]);
			exports.push(...exportList);
		}

		// Match default exports
		if (content.includes("export default")) {
			exports.push("default");
		}

		return exports;
	}

	private scanDirectory(dirPath: string): FileInfo[] {
		const files: FileInfo[] = [];

		try {
			const entries = readdirSync(dirPath);

			for (const entry of entries) {
				const fullPath = join(dirPath, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					files.push(...this.scanDirectory(fullPath));
				} else if (this.isRelevantFile(fullPath)) {
					try {
						const content = readFileSync(fullPath, "utf8");
						const relativePath = relative(this.srcPath, fullPath);

						const fileInfo: FileInfo = {
							path: fullPath,
							relativePath,
							imports: this.extractImports(content, fullPath),
							exports: this.extractExports(content),
							type: this.getFileType(fullPath),
						};

						files.push(fileInfo);
					} catch (error) {
						console.warn(`Warning: Could not read file ${fullPath}:`, error);
					}
				}
			}
		} catch (error) {
			console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
		}

		return files;
	}

	private buildDependencyGraph(files: FileInfo[]): DependencyGraph {
		const fileMap = new Map<string, FileInfo>();
		const dependencies = new Map<string, Set<string>>();
		const dependents = new Map<string, Set<string>>();

		// Build file map
		files.forEach((file) => {
			fileMap.set(file.relativePath, file);
			dependencies.set(file.relativePath, new Set());
			dependents.set(file.relativePath, new Set());
		});

		// Build dependency relationships
		files.forEach((file) => {
			file.imports.forEach((importPath) => {
				let resolvedPath = importPath;

				// Handle relative imports
				if (importPath.startsWith("./") || importPath.startsWith("../")) {
					const dir = dirname(file.relativePath);
					resolvedPath = relative("", join(dir, importPath));
				} else if (importPath.startsWith("@/")) {
					resolvedPath = importPath.substring(2);
				}

				// Try to find the actual file
				const possibleExtensions = [
					"",
					".ts",
					".vue",
					".js",
					"/index.ts",
					"/index.vue",
					"/index.js",
				];
				let foundFile = false;

				for (const ext of possibleExtensions) {
					const testPath = resolvedPath + ext;
					if (fileMap.has(testPath)) {
						dependencies.get(file.relativePath)?.add(testPath);
						dependents.get(testPath)?.add(file.relativePath);
						foundFile = true;
						break;
					}
				}

				if (!foundFile && !importPath.includes("node_modules")) {
					// This might be an external dependency or missing file
					// console.warn(`Could not resolve import: ${importPath} in ${file.relativePath}`);
				}
			});
		});

		return { files: fileMap, dependencies, dependents };
	}

	private classifyByDomain(files: FileInfo[]): DomainAnalysis {
		const domains: DomainAnalysis = {
			authentication: [],
			dashboard: [],
			workspace: [],
			subscribers: [],
			shared: [],
			unclassified: [],
		};

		files.forEach((file) => {
			const path = file.relativePath.toLowerCase();

			if (
				path.includes("account") ||
				path.includes("auth") ||
				path.includes("login") ||
				path.includes("register") ||
				path.includes("security") ||
				path.includes("user")
			) {
				domains.authentication.push(file.relativePath);
			} else if (path.includes("dashboard") || path.includes("home")) {
				domains.dashboard.push(file.relativePath);
			} else if (path.includes("workspace")) {
				domains.workspace.push(file.relativePath);
			} else if (path.includes("subscriber")) {
				domains.subscribers.push(file.relativePath);
			} else if (
				path.includes("component") ||
				path.includes("layout") ||
				path.includes("util") ||
				path.includes("config") ||
				path.includes("cache") ||
				path.includes("lib")
			) {
				domains.shared.push(file.relativePath);
			} else {
				domains.unclassified.push(file.relativePath);
			}
		});

		return domains;
	}

	private generateReport(
		graph: DependencyGraph,
		domains: DomainAnalysis,
	): string {
		const report = [];

		report.push("# Dependency Analysis Report");
		report.push("");
		report.push(`Generated on: ${new Date().toISOString()}`);
		report.push("");

		// File statistics
		report.push("## File Statistics");
		report.push("");
		const fileTypes = Array.from(graph.files.values()).reduce(
			(acc, file) => {
				acc[file.type] = (acc[file.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		Object.entries(fileTypes).forEach(([type, count]) => {
			report.push(`- ${type.toUpperCase()}: ${count} files`);
		});
		report.push(`- **Total**: ${graph.files.size} files`);
		report.push("");

		// Domain classification
		report.push("## Domain Classification");
		report.push("");
		Object.entries(domains).forEach(([domain, files]) => {
			report.push(
				`### ${domain.charAt(0).toUpperCase() + domain.slice(1)} (${files.length} files)`,
			);
			report.push("");
			files.slice(0, 10).forEach((file) => {
				report.push(`- ${file}`);
			});
			if (files.length > 10) {
				report.push(`- ... and ${files.length - 10} more files`);
			}
			report.push("");
		});

		// Dependency analysis
		report.push("## Dependency Analysis");
		report.push("");

		// Most connected files
		const connectionCounts = Array.from(graph.files.keys())
			.map((file) => ({
				file,
				dependencies: graph.dependencies.get(file)?.size || 0,
				dependents: graph.dependents.get(file)?.size || 0,
				total:
					(graph.dependencies.get(file)?.size || 0) +
					(graph.dependents.get(file)?.size || 0),
			}))
			.sort((a, b) => b.total - a.total);

		report.push("### Most Connected Files (Top 10)");
		report.push("");
		connectionCounts
			.slice(0, 10)
			.forEach(({ file, dependencies, dependents, total }) => {
				report.push(
					`- **${file}**: ${total} connections (${dependencies} deps, ${dependents} dependents)`,
				);
			});
		report.push("");

		// Circular dependencies detection
		report.push("### Potential Issues");
		report.push("");

		const circularDeps = this.findCircularDependencies(graph);
		if (circularDeps.length > 0) {
			report.push("#### Circular Dependencies Detected:");
			circularDeps.forEach((cycle) => {
				report.push(`- ${cycle.join(" → ")}`);
			});
		} else {
			report.push("- No circular dependencies detected ✅");
		}
		report.push("");

		return report.join("\n");
	}

	private findCircularDependencies(graph: DependencyGraph): string[][] {
		const visited = new Set<string>();
		const recursionStack = new Set<string>();
		const cycles: string[][] = [];

		const dfs = (file: string, path: string[]): void => {
			if (recursionStack.has(file)) {
				// Found a cycle
				const cycleStart = path.indexOf(file);
				if (cycleStart !== -1) {
					cycles.push([...path.slice(cycleStart), file]);
				}
				return;
			}

			if (visited.has(file)) {
				return;
			}

			visited.add(file);
			recursionStack.add(file);

			const deps = graph.dependencies.get(file) || new Set();
			deps.forEach((dep) => {
				dfs(dep, [...path, file]);
			});

			recursionStack.delete(file);
		};

		graph.files.forEach((_, file) => {
			if (!visited.has(file)) {
				dfs(file, []);
			}
		});

		return cycles;
	}

	public async analyze(): Promise<void> {
		this.log("Starting dependency analysis...");

		// Scan all files
		this.log("Scanning source files...");
		const files = this.scanDirectory(this.srcPath);
		this.log(`Found ${files.length} relevant files`);

		// Build dependency graph
		this.log("Building dependency graph...");
		const graph = this.buildDependencyGraph(files);

		// Classify by domain
		this.log("Classifying files by domain...");
		const domains = this.classifyByDomain(files);

		// Generate report
		this.log("Generating analysis report...");
		const report = this.generateReport(graph, domains);

		// Save reports
		const reportsDir = join(this.projectRoot, "scripts/migration-reports");
		try {
			const { mkdirSync } = await import("fs");
			mkdirSync(reportsDir, { recursive: true });
		} catch (error) {
			// Directory might already exist
		}

		const reportPath = join(reportsDir, "dependency-analysis.md");
		writeFileSync(reportPath, report);
		this.log(`Report saved to: ${relative(this.projectRoot, reportPath)}`);

		// Save raw data as JSON
		const dataPath = join(reportsDir, "dependency-data.json");
		const data = {
			files: Array.from(graph.files.values()),
			dependencies: Object.fromEntries(
				Array.from(graph.dependencies.entries()).map(([k, v]) => [
					k,
					Array.from(v),
				]),
			),
			dependents: Object.fromEntries(
				Array.from(graph.dependents.entries()).map(([k, v]) => [
					k,
					Array.from(v),
				]),
			),
			domains,
		};
		writeFileSync(dataPath, JSON.stringify(data, null, 2));
		this.log(`Raw data saved to: ${relative(this.projectRoot, dataPath)}`);

		this.log("Dependency analysis complete! ✨");
	}
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const analyzer = new DependencyAnalyzer();
	analyzer.analyze().catch((error) => {
		console.error("Analysis failed:", error);
		process.exit(1);
	});
}

export { DependencyAnalyzer };
