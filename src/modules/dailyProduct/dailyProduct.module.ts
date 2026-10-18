import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../files/files.entity';
import { FilesService } from '../files/files.service';
import { DailyProductController } from './dailyProduct.controller';
import { DailyProductEntity } from './dailyProduct.entity';
import { DailyProductService } from './dailyProduct.service';

@Module({
  imports: [TypeOrmModule.forFeature([DailyProductEntity, FileEntity])],
  providers: [DailyProductService, FilesService],
  exports: [DailyProductService],
  controllers: [DailyProductController],
})
export class DailyProductModule {}
