/** Return connection options compatible with BullMQ */
export function getRedisConnectionOptions() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const url = new URL(redisUrl);

  // Upstash and other cloud Redis providers use rediss:// (TLS)
  const useTls = url.protocol === "rediss:";

  return {
    host: url.hostname,
    port: parseInt(url.port || "6379"),
    password: url.password || undefined,
    username: url.username || undefined,
    maxRetriesPerRequest: null as null,
    ...(useTls ? { tls: {} } : {}),
  };
}
