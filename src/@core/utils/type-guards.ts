export function safeCast<T>(data: unknown, validator?: (d: unknown) => d is T): T[] {
  if (!data) return [];
  if (Array.isArray(data) && validator) {
    return data.filter(validator);
  }
  return (Array.isArray(data) ? data : []) as T[];
}

export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}
