import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis_sms.service.js';
import { redisProvider } from './redis.provider.js';

@Global()
@Module({
    providers: [RedisService , redisProvider],
    exports: [RedisService , redisProvider],
})
export class RedisModule {}