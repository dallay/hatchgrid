import type { CollectionEntry } from "astro:content";
import type Category from "../category/category.model";
import type Author from "@/models/author/author.model.ts";
import type {ImageMetadata} from "astro";
import type Tag from "@/models/tag/tag.model.ts";

export default interface Article {
  id: string;
  title: string;
  description: string;
  author: Author;
  cover?: ImageMetadata;
  tags: Tag[];
  draft: boolean;
  body: string;
  date: Date;
  lastModified?: Date;
	category: Category;
	featured: boolean;
	entry?: CollectionEntry<"articles">;
}
