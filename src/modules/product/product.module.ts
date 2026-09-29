import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from '../category/category.entity';
import { FilesService } from '../files/files.service';
import { FileEntity } from '../files/files.entity';
import { ProductVariantEntity } from '../productVariant/productVariant.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      FileEntity,
      ProductVariantEntity,
    ]),
  ],
  providers: [ProductService, FilesService],
  exports: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
