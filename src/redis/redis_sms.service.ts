import { Injectable, OnModuleDestroy} from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy{

    private readonly client : Redis;
    constructor(private readonly configService : ConfigService){const redisUrl = this.configService.get<string>('redis.url') ||   'redis://127.0.0.1:6379'; this.client = new Redis(redisUrl);}
    async set(key : string , value : string , expiry : number): Promise<void>{
        await this.client.set(key , value , "EX" , expiry);
    };
    async setIfNotExits(key : string , value : string , expiry : number): Promise<boolean>{
       const result = await this.client.set(key , value , "EX" , expiry , 'NX');
       return result === "OK"
    };
    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }
    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }
    async increment(key: string): Promise<number> {
        return await this.client.incr(key);
    }
    async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
}