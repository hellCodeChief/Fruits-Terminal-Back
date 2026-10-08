import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from 'src/modules/category/category.entity';
import { ProductUpdateDTO } from './dtos/ProductUpdate.dto';
import { Sort } from '../productVariant/productVariant.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(sort?: Sort) {
    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.properties', 'properties')
      .leftJoinAndSelect('properties.propertyValues', 'propertyValues')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.files', 'variantFiles')
      .leftJoinAndSelect('variants.propertyProductVariants', 'ppv')
      .leftJoinAndSelect('ppv.property', 'ppvProperty')
      .leftJoinAndSelect('ppv.propertyValue', 'ppvValue')
      .leftJoinAndSelect('product.files', 'files')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.deletedAt IS NULL');

    if (sort) {
      queryBuilder = this.adjustOrder(queryBuilder, sort);
    }

    const result = await queryBuilder.getMany();
    return result;
  }

  async findOne(productId: number) {
    return await this.productRepository.findOne({
      where: { id: productId, deletedAt: null },
      relations: [
        'properties',
        'properties.propertyValues',
        'files',
        'variants',
        'variants.files',
        'variants.propertyProductVariants.property',
        'variants.propertyProductVariants.propertyValue',
      ],
    });
  }

  async insert(
    productPayload: { slug: string; isActive?: boolean },
    categoryIds: Array<number>,
  ) {
    try {
      const product = this.productRepository.create(productPayload);

      await this.SyncCats(product, categoryIds);

      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(productPayload: ProductUpdateDTO, id: number) {
    const { categoryIds, ...fields } = productPayload;
    try {
      if (fields.slug !== undefined || fields.isActive !== undefined) {
        await this.productRepository.update({ id }, fields);
      }
      // ✅ دسته جدا از ستون‌های محصول است
      if (categoryIds) {
        await this.updateProductCategories(id, categoryIds);
      }
      return await this.productRepository.findBy({ id });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProductCategories(productId: number, categoryIds: Array<number>) {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['categories'],
      });

      if (!product) throw new NotFoundException('محصول موردنظر یافت نشد!');

      await this.SyncCats(product, categoryIds);

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: number) {
    const variant = await this.productRepository.findOneBy({ id });
    if (!variant)
      throw new HttpException('محصول موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.productRepository.softDelete(id);
    } catch (error) {
      throw new HttpException(
        { message: 'شکست در حذف نرم محصول', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async hardDelete(id: number) {
    const product = await this.productRepository.findOneBy({
      id,
      deletedAt: null,
    });
    if (!product)
      throw new HttpException('محصول موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.productRepository.delete(id);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PRIVATE METHODS ------------------------------------------------------------------------------------------
  private async SyncCats(product: ProductEntity, categoryIds: Array<number>) {
    // When updateProductCategories is called, "noCats" will be attached
    if (categoryIds.length === 0) {
      const noCats = await this.categoryRepository.findOneBy({
        slug: 'noCats',
      });
      product.categories = noCats ? [noCats] : [];
      return;
    }

    const categories = await this.categoryRepository.findBy({
      id: In(categoryIds),
    });
    if (categories.length !== categoryIds.length)
      throw new NotFoundException('شکست در یافتن یک یا چند دسته بندی');

    product.categories = categories;
  }
  private adjustOrder(queryBuilder: any, sort: Sort) {
    if (sort === Sort.ASC) {
      queryBuilder.orderBy('product.createdAt', 'ASC');
    } else if (sort === Sort.DESC) {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    } else if (sort === Sort.CHEAP) {
      queryBuilder.orderBy('variants.price', 'ASC');
    } else if (sort === Sort.EXPENSIVE) {
      queryBuilder.orderBy('variants.price', 'DESC');
    } else if (sort === Sort.MOSTLY_VISITED) {
      queryBuilder.orderBy('product.visitCount', 'DESC');
    }

    return queryBuilder;
  }
}
