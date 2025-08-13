
import { z } from 'zod';
import {TagColors } from './Tag'

/**
 * Zod schema for validating a Tag object.
 *
 * @property id - The unique identifier for the tag. Must be a non-empty string.
 * @property name - The display name of the tag. Must be between 2 and 50 characters.
 * @property color - The color assigned to the tag. Must be one of the values defined in TagColors enum. Defaults to TagColors.Default.
 * @property subscribers - The subscribers associated with the tag, represented as a string.
 */
export const tagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(50),
  color: z.enum(TagColors).default(TagColors.Default),
  subscribers: z.string(),
});
