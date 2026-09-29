import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMinioClient } from 'src/config/minio.config';

@Global() // To be used in other modules
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MINIO_CLIENT',
      inject: [ConfigService],
      useFactory: getMinioClient,
    },
  ],
  controllers: [],
  exports: ['MINIO_CLIENT'],
})
export class MinioModule { };
