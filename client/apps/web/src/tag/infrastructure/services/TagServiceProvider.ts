/**
 * Service provider implementation for dependency injection
 */

import type { TagServiceProvider } from "../../application/services/TagService";
import { TagServiceImpl } from "./TagServiceImpl";

/**
 * Default implementation of TagServiceProvider
 */
export class DefaultTagServiceProvider implements TagServiceProvider {
	private serviceInstance: TagServiceImpl | null = null;

	getTagService(): TagServiceImpl {
		if (!this.serviceInstance) {
			this.serviceInstance = new TagServiceImpl();
		}
		return this.serviceInstance;
	}

	/**
	 * Reset the service instance (for testing)
	 */
	reset(): void {
		this.serviceInstance = null;
	}
}
