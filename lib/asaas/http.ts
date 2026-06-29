export function getHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "access_token": apiKey,
    "User-Agent": "INVENTOY/1.0.0",
  } as const;
}
