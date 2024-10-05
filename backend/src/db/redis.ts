import { createClient, RedisClientType } from "redis";

const port = process.env.REDIS_PORT as unknown;
export const redisClient: RedisClientType = createClient({
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_CONN_STR as string,
		port: port as number,
	},
});

redisClient.on("error", (err) =>
	console.log("[redis] redis client error", err),
);
redisClient.on("connect", () => console.log("[redis] connected to the Redis"));
redisClient.on("disconnect", () =>
	console.log("[redis] disconnected from Redis"),
);

/**
 * Connects to the redis instance
 * @param client - Redis Client Type
 * .
 * .
 * @link https://redis.io/docs/latest/develop/connect/clients/nodejs/
 */
export async function connectRedis(client: RedisClientType) {
	try {
		await client.connect();
	} catch (error) {
		console.error(error);
	}
}

/**
 * Disconnects from the redis instance
 * @param client - Redis Client Type
 * .
 * .
 * @link https://redis.io/docs/latest/develop/connect/clients/nodejs/
 */
export async function disconnectRedis(client: RedisClientType) {
	try {
		await client.disconnect();
	} catch (error) {
		console.error(error);
	}
}
