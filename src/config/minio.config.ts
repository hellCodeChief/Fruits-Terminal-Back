import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

export const getMinioClient = (configService: ConfigService): Client => {
  return new Client({
    endPoint: configService.get<string>('MINIO_ENDPOINT') ?? 'localhost',
    port: configService.get<number>('MINIO_PORT') ?? 9000,
    useSSL: false,
    accessKey: configService.get<string>('MINIO_ACCESS_KEY'),
    secretKey: configService.get<string>('MINIO_SECRET_KEY'),
  });
};
