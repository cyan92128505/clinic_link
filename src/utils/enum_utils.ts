/**
 * A utility class providing methods for enum conversion and validation
 * @template T The enum type
 */
export class EnumUtils<T extends string> {
  private readonly enumObject: Record<string, T>;
  private readonly values: T[];

  /**
   * Create a new EnumUtils instance
   * @param enumObject - The enum object to provide utilities for
   */
  constructor(enumObject: Record<string, T>) {
    this.enumObject = enumObject;
    this.values = Object.values(enumObject);
  }

  /**
   * Convert string to enum value
   * @param value - String value to convert
   * @returns Corresponding enum value or undefined if not found
   */
  fromString(value: string): T | undefined {
    const normalizedValue = value?.toUpperCase?.();

    if (normalizedValue && this.values.includes(normalizedValue as T)) {
      return normalizedValue as T;
    }

    return undefined;
  }

  /**
   * Convert string to enum value with error handling
   * @param value - String value to convert
   * @throws Error if the string cannot be converted to a valid enum value
   * @returns Corresponding enum value
   */
  fromStringOrThrow(value: string): T {
    const enumValue = this.fromString(value);

    if (enumValue === undefined) {
      throw new Error(`Invalid enum value: ${value}`);
    }

    return enumValue;
  }

  /**
   * Check if a string is a valid enum value
   * @param value - String value to check
   * @returns boolean indicating if the string is a valid enum value
   */
  isValid(value: string): boolean {
    return this.fromString(value) !== undefined;
  }

  /**
   * Get all available enum values
   * @returns Array of all enum values
   */
  getAll(): T[] {
    return [...this.values];
  }
}
