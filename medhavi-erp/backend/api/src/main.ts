import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applySwagger } from './bootstrap/swagger.bootstrap';
import { applyValidation } from './bootstrap/validation.bootstrap';
import { applyCors } from './bootstrap/cors.bootstrap';
import { applyHelmet } from './bootstrap/helmet.bootstrap';
import { applyCompression } from './bootstrap/compression.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');
  applyHelmet(app);
  applyCompression(app);
  applyCors(app);
  applyValidation(app);
  applySwagger(app);
  await app.listen(process.env.API_PORT ?? 4000);
}
void bootstrap();