export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function toError(error: unknown, fallback: string): Error {
  return error instanceof Error ? error : new Error(fallback);
}

export function buildHttpErrorMessage({
  action,
  path,
  status,
  detail,
}: {
  action: string;
  path: string;
  status: number;
  detail?: string;
}): string {
  const statusText = `HTTP ${status}`;
  return detail
    ? `${action} failed (${statusText} at ${path}): ${detail}`
    : `${action} failed (${statusText} at ${path}).`;
}
