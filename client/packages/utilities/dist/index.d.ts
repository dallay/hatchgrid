/**
 * Generates a Gravatar URL for the given email.
 *
 * @param {string} email - The email address to generate the Gravatar URL for.
 * @param {number} [size=100] - The size of the Gravatar image. Defaults to 100 if not provided.
 * @returns {string} The Gravatar URL for the given email and size.
 */
export declare function (email: string, size?: number): string;

/**
 * Divides an array into groups of the specified size. If the array cannot be evenly divided,
 * the last group will be of the remaining size.
 *
 * @param input - The array to divide into groups.
 * @param size - The size of each group.
 * @returns A new array with the groups.
 *
 * @example
 * chunk(['a', 'b', 'c', 'd'], 2); // Returns: [['a', 'b'], ['c', 'd']]
 * chunk(['a', 'b', 'c', 'd'], 3); // Returns: [['a', 'b', 'c'], ['d']]
 */
export declare function chunk<T>(input: T[], size: number): T[][];

export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number, immediate?: boolean): DebouncedFunction<T>;

/**
 * Creates a debounced function that delays invoking the provided function until after
 * a specified wait time has elapsed since the last time the debounced function was called.
 * Optionally, the function can be invoked immediately on the leading edge instead of the trailing.
 *
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} [immediate] - If `true`, triggers the function on the leading edge, instead of the trailing.
 * @returns {DebouncedFunction<T>} - Returns the new debounced function.
 */
declare type DebouncedFunction<T extends (...args: unknown[]) => unknown> = (...args: Parameters<T>) => void;

/**
 * Formats a date into a localized long date string.
 *
 * @param {Date|string|undefined} date - The date to format.
 * @param {string} [locale] - The locale to use for formatting (defaults to browser’s locale or "en-US").
 * @returns {string} The formatted date string or empty string if the date is invalid.
 *
 * @example
 * formatDate(new Date(2023, 3, 12));
 * // → "April 12, 2023" (varies by locale)
 *
 * @example
 * formatDate(new Date(2023, 3, 12), "de-DE");
 * // → "12. April 2023"
 */
export declare function formatDate(date: Date | string | undefined, locale?: string): string;

/**
 * Generates a random word or phrase from a given list of words.
 *
 * @param {string[]} [wordList=defaultWords] - The list of words to choose from. Defaults to `defaultWords`.
 * @param {number} [count=defaultCount] - The number of words to generate. Defaults to `defaultCount`.
 * @returns {string} A string containing the generated random words joined by a space.
 */
export declare function generateRandomWords(wordList?: string[], count?: number): string;

/**
 * Groups the elements of an array based on the given key getter function.
 *
 * @param list - The array to group.
 * @param keyGetter - The function that defines the key to group by.
 * @returns An object where the keys are the group keys and the values are arrays of elements in that group.
 *
 * @example
 * groupBy(['one', 'two', 'three'], item => item.length);
 * // Returns: {3: ["one", "two"], 5: ["three"]}
 *
 * groupBy([1.3, 2.1, 2.4], num => Math.floor(num));
 * // Returns: {1: [1.3], 2: [2.1, 2.4]}
 */
export declare function groupBy<T, K extends keyof any>(list: T[], keyGetter: (input: T) => K): Record<K, T[]>;

/**
 * Generates initials from a full name.
 *
 * @param {string} fullName - The full name to generate initials from.
 * @returns {string} The initials of the given full name.
 */
export declare function (fullName: string): string;

export declare const isDarkMode: (key?: string, darkThemeClass?: string) => boolean;

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 *
 * This function works by comparing the values directly if they are not objects.
 * If they are objects, it compares their keys and their corresponding values.
 * If the values of a key are also objects, it recursively calls `isEqual` to compare them.
 *
 * Note: This function is a simplified version and may not cover all edge cases that lodash's `isEqual` function does.
 * For example, it does not handle comparisons for functions, DOM nodes, Maps, Sets, etc.
 * If you need to handle these cases, you might want to consider sticking with lodash's `isEqual` or another library that provides deep equality checks.
 *
 * @param {unknown} value - The first value to compare.
 * @param {unknown} other - The second value to compare.
 * @returns {boolean} - Returns `true` if the values are equivalent, else `false`.
 */
export declare function isEqual(value: unknown, other: unknown): boolean;

/**
 * Loads the theme from localStorage and applies it to the document. If the theme is not set in localStorage,
 * it will use the system preference. If the system preference is not set, it will use the light theme.
 * The theme is stored in localStorage.
 *
 * @param key  - The key in localStorage where the theme is stored.
 * @param darkThemeClass - The class representing the dark theme. Default is 'dark'.
 * @param lightThemeClass - The class representing the light theme. Default is 'light'.
 * @returns void
 */
export declare const loadTheme: (key?: string, darkThemeClass?: string, lightThemeClass?: string) => void;

/**
 * Offsets a date by a specified number of months and returns the ISO date string (YYYY-MM-DD).
 *
 * @param {number} offsetMonths - The number of months to offset, defaults to 0.
 * @param {Date} date - The date to offset, defaults to the current date.
 * @returns {string} - ISO date string (YYYY-MM-DD) of the offset date.
 *
 * @example
 * // Returns the ISO date string for 3 months from now
 * const futureDate = offsetDate(3);
 *
 * // Returns the ISO date string for 2 months before a specific date
 * const pastDate = offsetDate(-2, new Date('2023-05-15'));
 */
export declare function offsetDate(offsetMonths?: number, date?: Date): string;

/**
 * Type definition for order. It can be either 'asc' for ascending order or 'desc' for descending order.
 */
declare type Order = "asc" | "desc";

/**
 * Sorts an array of objects based on multiple keys and orders.
 *
 * @param array - The array to sort.
 * @param keys - The keys of the object to sort by.
 * @param orders - The order for each key. It should be either 'asc' for ascending order or 'desc' for descending order.
 * @returns A new array sorted by the specified keys and orders.
 *
 * @example
 * orderBy([{name: 'banana', type: 'fruit'}, {name: 'apple', type: 'fruit'}], ['type', 'name'], ['asc', 'desc']);
 * // Returns: [{name: 'banana', type: 'fruit'}, {name: 'apple', type: 'fruit'}]
 */
export declare function orderBy<T>(array: T[], keys: (keyof T)[], orders: Order[]): T[];

/**
 * Returns a random element from the provided array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} array - The array from which to select a random element.
 * @returns {T} A random element from the array.
 */
export declare function randomElement<T>(array: Array<T>): T;

/**
 * Generates a random integer between the specified start and end values, inclusive.
 *
 * @param {number} start - The lower bound of the range.
 * @param {number} end - The upper bound of the range.
 * @returns {number} A random integer between start and end, inclusive.
 */
export declare function (start: number, end: number): number;

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end.
 * If end is not specified it’s set to start with start then set to 0.
 * If end is less than start a zero-length range is created unless a negative step is specified.
 *
 * @param start – The start of the range.
 * @param end – The end of the range.
 * @param step – The value to increment or decrement by.
 * @returns Returns a new range array.
 *
 * @example
 * range(1, 5, 1); // Returns: [1, 2, 3, 4]
 * range(5, 1, -1); // Returns: [5, 4, 3, 2]
 * range(5, 1, 1); // Returns: []
 * range(1, 5, -1); // Returns: []
 * range(5, 5, 1); // Returns: []
 * range(0, 5, 1); // Returns: [0, 1, 2, 3, 4]
 */
export declare function range(start: number, end?: number, step?: number): number[];

/**
 * The `remove` function modifies the original array by removing elements that satisfy the provided predicate function.
 * It returns a new array containing the removed elements.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The original array to be modified.
 * @param {(value: T, index: number, array: T[]) => boolean} predicate - The function invoked per iteration.
 * @returns {T[]} - A new array of removed elements.
 *
 * @example
 * const array = [1, 2, 3, 4];
 * const removed = remove(array, (n) => n % 2 === 0);
 * console.log(array); // Output: [1, 3]
 * console.log(removed); // Output: [2, 4]
 */
export declare function remove<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[];

/**
 * Sorts an array of objects based on a single key or a key getter function.
 *
 * @param array - The array to sort.
 * @param keyOrGetter - The key of the object to sort by or a function that returns the key.
 * @returns A new array sorted by the specified key or key getter function.
 *
 * @example
 * sortBy([{name: 'banana'}, {name: 'apple'}], 'name');
 * // Returns: [{name: 'apple'}, {name: 'banana'}]
 *
 * sortBy([{name: 'banana', age: 2}, {name: 'apple', age: 1}], item => item.age);
 * // Returns: [{name: 'apple', age: 1}, {name: 'banana', age: 2}]
 */
export declare function sortBy<T>(array: T[], keyOrGetter: keyof T | ((item: T) => unknown)): T[];

/**
 * Toggles the theme and stores the new value in localStorage.
 * @param {string} key - The key in localStorage where the theme is stored.
 * @param {string} darkThemeClass - The class representing the dark theme. Default is 'dark'.
 * @param lightThemeClass - The class representing the light theme. Default is 'light'.
 * @returns void
 */
export declare const toggleTheme: (key?: string, darkThemeClass?: string, lightThemeClass?: string) => void;

export { }
