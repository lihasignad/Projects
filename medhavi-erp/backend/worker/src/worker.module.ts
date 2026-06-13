import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
    }),
  ],
})
export class WorkerModule {}