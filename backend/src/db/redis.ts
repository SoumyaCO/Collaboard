import {
	ClientClosedError,
	createClient,
	DisconnectsClientError,
	RedisClientType,
} from "redis";

const isLocalEnv: boolean = process.env.NODE_ENVIRONMENT === "local";
const port = process.env.REDIS_PORT as unknown;
export const redisClient: RedisClientType = createClient({
	password: isLocalEnv ? undefined : (process.env.REDIS_PASSWORD as string),
	socket: {
		host: isLocalEnv ? "127.0.0.1" : (process.env.REDIS_CONN_STR as string),
		port: isLocalEnv ? 6379 : (port as number),
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
		if (error == DisconnectsClientError) {
			console.log("[Connect] DisconnectsClientError");
		} else if (error == ClientClosedError) {
			console.log("[Connect] ClientClosedError");
		} else {
			console.log("[Connect] Error Occurred");
		}
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
		if (error == DisconnectsClientError) {
			console.log("[Disconnect] DisconnectsClientError");
		} else if (error == ClientClosedError) {
			console.log("[Disconnect] ClientClosedError");
		} else {
			console.log("[Disconnect] Error Occurred");
		}
	}
}
