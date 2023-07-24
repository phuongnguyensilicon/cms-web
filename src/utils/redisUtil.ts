import Redis from "ioredis";

export function createRedisConnection() {
  return new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process!.env!.REDIS_PORT as string),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  });
}
