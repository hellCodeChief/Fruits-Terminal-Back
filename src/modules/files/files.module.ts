import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './files.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MinioModule } from './minio/minio.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([FileEntity]),
        MinioModule,
    ],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService, MinioModule],
})
export class FilesModule { };
