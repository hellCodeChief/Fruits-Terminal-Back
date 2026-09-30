import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from '../category/category.entity';
import { FilesService } from '../files/files.service';
import { FileEntity } from '../files/files.entity';
import { ProductService } from './product.service';
import { ProductVitrineService } from './product-vitrine.service';
import { ProductController } from './product.controller';
import { VitrineEntryEntity } from './vitrine-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      FileEntity,
      VitrineEntryEntity,
    ]),
  ],
  providers: [ProductService, ProductVitrineService, FilesService],
  exports: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
