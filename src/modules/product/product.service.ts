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
import { ProductInsertDTO } from './dtos/ProductInsert.dto';
import { ProductVariantEntity } from '../productVariant/productVariant.entity';
import { Sort } from '../productVariant/productVariant.enum';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepository: Repository<ProductVariantEntity>,
    private readonly filesService: FilesService,
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

  async insert(payload: ProductInsertDTO, file: Express.Multer.File) {
    const product = this.productRepository.create({
      slug: payload.slug || payload.name,
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    });

    await this.SyncCats(product, payload.categoryIds ?? []);

    let saved: ProductEntity;
    try {
      saved = await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const variant = await this.createDefaultVariant(saved.id, payload);
      await this.productRepository.update(
        { id: saved.id },
        { defaultVariantId: variant.id },
      );
      await this.filesService.uploadFile(file, {
        targetId: saved.id,
        usage: 'product',
      });
      return await this.findOne(saved.id);
    } catch (error) {
      await this.variantRepository.delete({ productId: saved.id });
      await this.productRepository.delete({ id: saved.id });
      if (error instanceof HttpException) throw error;
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    payload: ProductUpdateDTO,
    id: number,
    file?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);
    if (!product)
      throw new HttpException('محصول موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    try {
      const productPatch: Partial<ProductEntity> = {};
      if (payload.slug !== undefined) productPatch.slug = payload.slug;
      else if (payload.name !== undefined) productPatch.slug = payload.name;
      if (payload.isActive !== undefined) productPatch.isActive = payload.isActive;

      if (Object.keys(productPatch).length > 0) {
        await this.productRepository.update({ id }, productPatch);
      }

      if (payload.categoryIds !== undefined) {
        await this.updateProductCategories(id, payload.categoryIds);
      }

      await this.syncSaleFields(product, payload);

      if (file) {
        await this.filesService.uploadFile(file, {
          targetId: id,
          usage: 'product',
        });
        for (const previous of product.files ?? []) {
          await this.filesService.delete(previous.id, 'product');
        }
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
    if (!categoryIds || categoryIds.length === 0) {
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

  private async createDefaultVariant(
    productId: number,
    payload: { name: string; price: number; description?: string; isActive?: boolean },
  ) {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const variant = this.variantRepository.create({
      name: payload.name,
      slug: `item-${productId}-${stamp}`,
      sku: `sku-${productId}-${stamp}`,
      price: payload.price,
      desc: payload.description || null,
      productId,
      stock: 0,
      isActive: payload.isActive ?? true,
    });
    return await this.variantRepository.save(variant);
  }

  private async syncSaleFields(product: ProductEntity, payload: ProductUpdateDTO) {
    const touchesSale =
      payload.name !== undefined ||
      payload.price !== undefined ||
      payload.description !== undefined;
    if (!touchesSale) return;

    const current =
      product.variants?.find((variant) => variant.id === product.defaultVariantId) ||
      product.variants?.[0];

    if (!current) {
      if (payload.name === undefined || payload.price === undefined) return;
      const created = await this.createDefaultVariant(product.id, {
        name: payload.name,
        price: payload.price,
        description: payload.description,
        isActive: payload.isActive,
      });
      await this.productRepository.update(
        { id: product.id },
        { defaultVariantId: created.id },
      );
      return;
    }

    if (payload.name !== undefined) current.name = payload.name;
    if (payload.price !== undefined) current.price = payload.price;
    if (payload.description !== undefined) current.desc = payload.description || null;
    if (payload.isActive !== undefined) current.isActive = payload.isActive;
    await this.variantRepository.save(current);
  }
}
