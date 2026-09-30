import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../category/category.entity';
import { ProductEntity } from '../product/product.entity';
import { VitrineController } from './vitrine.controller';
import { VitrineEntryEntity } from './vitrine-entry.entity';
import { VitrineService } from './vitrine.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VitrineEntryEntity, ProductEntity, CategoryEntity]),
  ],
  controllers: [VitrineController],
  providers: [VitrineService],
})
export class VitrineModule {}
