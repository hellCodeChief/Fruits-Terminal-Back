import { Module } from '@nestjs/common';
import { ProductVariantService } from './productVariant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantEntity } from './productVariant.entity';
import { ProductEntity } from '../product/product.entity';
import { PropertyValueEntity } from '../propertyValue/propertyValue.entity';
import { FilesService } from '../files/files.service';
import { ProductModule } from 'src/modules/product/product.module';
import { FileEntity } from '../files/files.entity';
import { ProductVariantController } from './productVariant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariantEntity,
      ProductEntity,
      PropertyValueEntity,
      FileEntity,
    ]),
    ProductModule,
  ],
  providers: [ProductVariantService, FilesService],
  controllers: [ProductVariantController],
})
export class ProductVariantModule {}
