import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider = {
    provide: REDIS_CLIENT,

    useFactory: () => {
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });

        redis.on('connect', () => {
            console.log('Redis connected successfully');
        });

        redis.on('error', (error) => {
            console.error('Redis error:', error.message);
        });

        return redis;
    },
};