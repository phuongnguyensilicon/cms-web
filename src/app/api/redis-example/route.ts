import { createRedisConnection } from "@/utils/redisUtil";

export async function POST(request: Request) {
  const { name } = await request.json();

  const redis = createRedisConnection();

  await redis.set("test", name);

  console.log(name);

  return new Response("Hello, Next.js!");
}
