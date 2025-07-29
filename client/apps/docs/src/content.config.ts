import {defineCollection} from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import {glob} from "astro/loaders";

// const baseDocs = defineCollection({
//   loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "docs" }),
//   schema: docsSchema()
// });

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
