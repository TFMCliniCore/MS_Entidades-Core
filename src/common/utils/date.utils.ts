export function toDateOrUndefined(value?: string): Date | undefined {
  return value ? new Date(value) : undefined;
}
