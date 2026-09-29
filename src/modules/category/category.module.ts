import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { CategoryClosureEntity } from './categoryClosure/categoryClosure.entity';
import { FilesService } from '../files/files.service';
import { ProductEntity } from '../product/product.entity';
import { PropertyEntity } from '../property/property.entity';
import { FileEntity } from '../files/files.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryClosureModule } from './categoryClosure/categoryClosure.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, CategoryClosureEntity, PropertyEntity, FileEntity, ProductEntity]), CategoryClosureModule],
  providers: [CategoryService, FilesService],
  controllers: [CategoryController],
  exports: [CategoryClosureModule]
})
export class CategoryModule { };