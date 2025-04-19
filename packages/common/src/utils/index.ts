export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function removeNullOrUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!isNullOrUndefined(value)) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
