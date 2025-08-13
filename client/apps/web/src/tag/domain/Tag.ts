import type { TagResponse } from "./TagResponse";

/**
 * Represents a Tag entity with properties and methods for managing tags.
 */
export class Tag {
  /**
   * Unique identifier for the tag.
   * @type {string}
   */
  id: string;

  /**
   * Name of the tag.
   * @type {string}
   */
  name: string;

  /**
   * Color of the tag, represented as an enum value.
   * @type {TagColors}
   */
  color: TagColors;

  /**
   * List of subscribers associated with the tag.
   * Can be a string (comma-separated) or an array of strings.
   * @type {ReadonlyArray<string> | string}
   */
  subscribers: ReadonlyArray<string> | string;

  /**
   * Date when the tag was created.
   * Can be a Date object or a string.
   * @type {Date | string | undefined}
   */
  createdAt?: Date | string;

  /**
   * Date when the tag was last updated.
   * Can be a Date object or a string.
   * @type {Date | string | undefined}
   */
  updatedAt?: Date | string;

  /**
   * Constructs a new Tag instance.
   * @param {Partial<Tag> & { id: string; name: string }} params - Partial tag properties with required `id` and `name`.
   */
  constructor({
    id,
    name,
    color = TagColors.Default,
    subscribers = [],
    createdAt,
    updatedAt,
  }: Partial<Tag> & { id: string; name: string }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.subscribers = subscribers;
    this.createdAt = this.normalizeDate(createdAt);
    this.updatedAt = this.normalizeDate(updatedAt);
  }

  /**
   * Creates a Tag instance from a TagResponse object.
   * @param {TagResponse} response - The response object containing tag data.
   * @returns {Tag} A new Tag instance.
   */
  static fromResponse(response: TagResponse): Tag {
    const color = Object.values(TagColors).includes(response.color as TagColors)
      ? response.color
      : TagColors.Default;
    const subscribers = Tag.normalizeSubscribers(response.subscribers);
    return new Tag({
      id: response.id,
      name: response.name,
      color: color as TagColors,
      subscribers: subscribers,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    });
  }

  /**
   * Gets the CSS class associated with the tag's color.
   * @returns {string} The CSS class for the tag's color.
   */
  get colorClass(): string {
    return colorClasses[this.color] || colorClasses[TagColors.Default];
  }

  /**
   * Gets the count of subscribers for the tag.
   * @returns {number} The number of subscribers.
   */
  get subscriberCount(): number {
    return this.subscribers.length;
  }

  /**
   * Normalizes a date value to a Date object or undefined.
   * @param {Date | string | undefined} date - The date value to normalize.
   * @returns {Date | undefined} A normalized Date object or undefined.
   */
  private normalizeDate(date?: Date | string): Date | undefined {
    if (typeof date === 'string') {
      const normalized = new Date(date);
      // Preserve the original ISO format by creating a custom Date with overridden toISOString
      if (date.endsWith('Z') && !date.includes('.')) {
        Object.defineProperty(normalized, 'toISOString', {
          value: () => date,
          writable: false,
          enumerable: false,
          configurable: false
        });
      }
      return normalized;
    }
    return date;
  }

  /**
   * Normalizes the subscribers value to an array of strings.
   * @param {ReadonlyArray<string> | string} subscribers - The subscribers value to normalize.
   * @returns {ReadonlyArray<string>} An array of subscriber strings.
   */
  private static normalizeSubscribers(
    subscribers: ReadonlyArray<string> | string,
  ): ReadonlyArray<string> {
    return Array.isArray(subscribers) ? subscribers : (subscribers as string).split(',');
  }
}

/**
 * Enum representing available tag colors.
 */
export enum TagColors {
  Default = 'default',
  Purple = 'purple',
  Pink = 'pink',
  Red = 'red',
  Blue = 'blue',
  Yellow = 'yellow',
}

/**
 * Mapping of tag colors to their corresponding CSS classes.
 * @type {Record<TagColors, string>}
 */
export const colorClasses: Record<TagColors, string> = {
  [TagColors.Red]: 'bg-red-100 text-red-800 border-red-200',
  [TagColors.Blue]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TagColors.Purple]: 'bg-purple-100 text-purple-800 border-purple-200',
  [TagColors.Pink]: 'bg-pink-100 text-pink-800 border-pink-200',
  [TagColors.Yellow]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TagColors.Default]: 'bg-gray-100 text-gray-800 border-gray-200',
};
