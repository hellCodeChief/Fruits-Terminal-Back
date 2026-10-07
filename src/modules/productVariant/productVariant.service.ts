import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { VariantDTO } from './dtos/ProductVariantInsert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantEntity } from './productVariant.entity';
import {
  DataSource,
  In,
  Repository,
  Brackets,
} from 'typeorm';
import { ProductEntity } from 'src/modules/product/product.entity';
import { PropertyProductVariantEntity } from 'src/modules/propertyProductVariant/propertyProductVariant.entity';
import { PropertyValueEntity } from 'src/modules/propertyValue/propertyValue.entity';
import { ProductVariantUpdateDTO } from './dtos/ProductVariantUpdate.dto';
import { VariantUpdateItemDTO } from './dtos/ProductVariantBatchUpdate.dto';
import { EntityManager } from 'typeorm';
import { ProductService } from '../product/product.service';
import { Sort } from './productVariant.enum';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepository: Repository<ProductVariantEntity>,
    @InjectRepository(PropertyValueEntity)
    private readonly PropertyValueRepository: Repository<PropertyValueEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
  ) { }

  async findAll(
    filters: any,
    sort: Sort,
    pagination: { page: number; page_size: number },
  ) {
    try {
      // Normalize pagination with defaults and limits
      const normalizedPage = Math.max(1, pagination.page || 1);
      const normalizedPageSize = Math.min(
        100,
        Math.max(1, pagination.page_size || 20),
      );

      const hasFilter =
        filters &&
        Object.keys(filters).some((key) => {
          const val = filters[key];
          if (Array.isArray(val)) return val.length > 0;
          return val !== undefined && val !== null;
        });

      const hasSort = typeof sort === 'string' && sort.length > 0;

      // Build base product query
      let productQuery = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('variants.files', 'variantFiles')
        .leftJoinAndSelect('product.files', 'files')
        .leftJoinAndSelect('product.categories', 'categories')
        .where('product.deletedAt IS NULL');

      // Apply filters using subquery to avoid loading all variants into memory
      if (hasFilter) {
        // Create subquery to get distinct product IDs that match filters
        const variantSubquery = this.productVariantRepository
          .createQueryBuilder('variant')
          .select('variant.productId', 'productId')
          .distinct(true)
          .leftJoin('variant.product', 'product')
          .where('variant.deletedAt IS NULL')
          .andWhere('product.deletedAt IS NULL');

        // Apply filters to subquery
        this.adjustFilters(variantSubquery, filters);

        // Get product IDs from subquery (this is memory efficient)
        const productIdResults = await variantSubquery.getRawMany();
        const productIds = productIdResults
          .map((r) => r.productId)
          .filter((id) => id !== null && id !== undefined);

        if (productIds.length === 0) {
          return {
            items: [],
            total: 0,
            page: normalizedPage,
            page_size: normalizedPageSize,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          };
        }

        // Add additional relations needed for filtered queries
        productQuery
          .leftJoinAndSelect('variants.propertyProductVariants', 'ppv')
          .leftJoinAndSelect('ppv.property', 'ppvProperty')
          .leftJoinAndSelect('ppv.propertyValue', 'ppvValue')
          .leftJoinAndSelect('product.properties', 'properties')
          .leftJoinAndSelect('properties.propertyValues', 'propertyValues')
          .andWhere('product.id IN (:...ids)', { ids: productIds });
      }

      // Apply sorting
      if (hasSort) {
        productQuery = this.adjustOrder(productQuery, sort);
      }

      // Get total count before pagination (for accurate pagination info)
      const total = await productQuery.getCount();

      // Apply pagination
      productQuery.take(normalizedPageSize);
      productQuery.skip((normalizedPage - 1) * normalizedPageSize);

      // Execute query
      const items = await productQuery.getMany();

      const totalPages = Math.ceil(total / normalizedPageSize);

      return {
        items,
        total,
        page: normalizedPage,
        page_size: normalizedPageSize,
        totalPages,
        hasNextPage: normalizedPage < totalPages,
        hasPreviousPage: normalizedPage > 1,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new HttpException(
        { error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(productVariantId: number) {
    return await this.productVariantRepository.findOne({
      where: { id: productVariantId, deletedAt: null },
      relations: [
        'product',
        'propertyProductVariants.property',
        'propertyProductVariants.propertyValue',
      ],
    });
  }

  async insert(variants: Array<VariantDTO>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // Connect to the database

    await queryRunner.startTransaction();
    try {
      const inserted_variant_ids: Array<number> = [];
      for (const each_variant of variants) {
        // Generate SKU
        await this.generateSKU(each_variant);

        const entity = this.productVariantRepository.create(each_variant);
        const inserted_variant = await queryRunner.manager.save(entity);
        inserted_variant_ids.push(inserted_variant.id);

        // Update "defaultVariantId" of product
        const has_isDefault = each_variant.isDefault;
        const inserted_variant_id: number = inserted_variant.id;
        if (has_isDefault) {
          const productId: number = inserted_variant.productId;
          await queryRunner.manager
            .createQueryBuilder()
            .update(ProductEntity)
            .set({ defaultVariantId: inserted_variant_id })
            .where('id = :id', { id: productId })
            .execute();
        }

        // Add properties
        const has_props = each_variant.props && each_variant.props.length > 0;
        if (has_props)
          await this.syncProperties(
            queryRunner.manager,
            each_variant.props,
            inserted_variant_id,
          );
      }

      await queryRunner.commitTransaction();

      return await this.productVariantRepository.find({
        where: { id: In(inserted_variant_ids) },
        relations: [
          'product',
          'propertyProductVariants.property',
          'propertyProductVariants.propertyValue',
        ],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async update(variant: ProductVariantUpdateDTO, variantId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // Connect to the database

    const is_variant_exists = await this.productVariantRepository.findOneBy({
      id: variantId,
    });
    if (!is_variant_exists)
      throw new HttpException('واریانت موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    await queryRunner.startTransaction();
    try {
      // Update "defaultVariantId" of product
      const has_isDefault = variant.isDefault;
      if (has_isDefault) {
        const productId: number = variant.productId;
        await queryRunner.manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ defaultVariantId: variantId })
          .where('id = :id', { id: productId })
          .execute();
      }

      // Update productVariant
      const { isDefault, props, ...variantPayload } = variant;
      await queryRunner.manager
        .createQueryBuilder()
        .update(ProductVariantEntity)
        .set(variantPayload)
        .where('id = :id', { id: variantId })
        .execute();

      // Add properties
      const has_props = variant.props && variant.props.length > 0;
      if (has_props)
        await this.syncProperties(queryRunner.manager, props, variantId);

      await queryRunner.commitTransaction();

      return await this.productVariantRepository.findOne({
        where: { id: variantId },
        relations: [
          'product',
          'propertyProductVariants.property',
          'propertyProductVariants.propertyValue',
        ],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async updateMany(variants: VariantUpdateItemDTO[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const updatedVariants = [];

    try {
      // Sync variants
      for (const variant of variants) {
        const { isDefault, props, ...variantPayload } = variant;
        let variantId = variant.id;

        if (variantId) {
          const is_variant_exists = await this.productVariantRepository.findOneBy({ id: variantId });
          if (!is_variant_exists)
            throw new Error(`Variant: ${variantId} not found!`)
        } else {
          await this.generateSKU(variant);
          variantPayload.sku = variant.sku;
          const entity = this.productVariantRepository.create(variantPayload);
          const newVar = await queryRunner.manager.save(entity);
          variantId = newVar.id;
        }

        // Set default variant for product
        if (isDefault && variant.productId) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(ProductEntity)
            .set({ defaultVariantId: variantId })
            .where('id = :id', { id: variant.productId })
            .execute();
        }

        await queryRunner.manager
          .createQueryBuilder()
          .update(ProductVariantEntity)
          .set(variantPayload)
          .where('id = :id', { id: variant.id })
          .execute();

        if (props && props.length > 0) {
          await this.syncProperties(queryRunner.manager, props, variantId);
        }

        updatedVariants.push({
          id: variantId,
          ...variantPayload,
          isDefault,
          productId: variant.productId,
        });
      }

      // ✅ ذخیره فقط همین ردیف‌ها را به‌روز می‌کند؛ حذف خودکار بقیه، تنوع‌های دیگر جدول را پاک می‌کرد
      await queryRunner.commitTransaction();

      return updatedVariants;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: number) {
    const variant = await this.productVariantRepository.findOneBy({ id });
    if (!variant)
      throw new HttpException('واریانت موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.productVariantRepository.softDelete(id);
    } catch (error) {
      throw new HttpException(
        { message: 'شکست در حذف نرم واریانت', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async hardDelete(id: number) {
    const varaint = await this.productVariantRepository.findOneBy({
      id,
      deletedAt: null,
    });
    if (!varaint)
      throw new HttpException('واریانت موردنظر یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.productVariantRepository.delete(id);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PRIVATE METHODS ------------------------------------------------------------------------------------------
  private async syncProperties(
    queryRunnerManager: EntityManager,
    props: Array<{ propertyId: number; propertyValueId: number }>,
    productVariantId: number,
  ) {
    const ppv_object: any = { productVariantId };

    // Remove previous PropertyProductVariant for this variant
    await queryRunnerManager
      .createQueryBuilder()
      .delete()
      .from(PropertyProductVariantEntity)
      .where('productVariantId = :productVariantId', { productVariantId })
      .execute();

    // Add props
    for (const prop of props) {
      ppv_object.propertyId = prop.propertyId;
      ppv_object.propertyValueId = prop.propertyValueId;

      await queryRunnerManager
        .createQueryBuilder()
        .insert()
        .into(PropertyProductVariantEntity)
        .values({ ...ppv_object })
        .execute();
    }
  }

  private async generateSKU(each_variant: any) {
    let sku_prop_type_limit = Number(process.env.SKU_PROP_TYPE_LIMIT) || 3;
    const productVariantSlug = each_variant.slug.split(' ').join('_') || 'prod';
    const props = each_variant.props ?? [];

    // Get all types of productVariant's property
    const seen = new Set<number>();
    const uniqueProperties = props.filter((prop) => {
      if (seen.has(prop.propertyId)) return false;
      seen.add(prop.propertyId);
      return true;
    });

    // Check if properties of product are less than SKU_PROP_TYPE_LIMIT
    sku_prop_type_limit = Math.min(
      sku_prop_type_limit,
      uniqueProperties.length,
    );

    const shuffledProperties: any = this.shuffleArray(uniqueProperties);
    // Select a random subset of properties based on sku_prop_type_limit
    const propValueIds = shuffledProperties
      .slice(0, sku_prop_type_limit)
      .map((prop) => prop?.propertyValueId!);

    if (propValueIds.length === 0) {
      each_variant.sku = `${productVariantSlug}-${Date.now()}`;
      return;
    }

    // Get chosen propertyValues from db
    const propertyValues = await this.PropertyValueRepository.find({
      where: { id: In(propValueIds) },
      select: ['Evalue'],
    });

    // Array of Abbreviation codes
    const propertyEvalues = propertyValues
      .map(
        (pv) =>
          pv.Evalue.substring(
            0,
            Number(process.env.SKU_PROP_VALUE_LETTERS_LIMIT || 3),
          )
            .trim()
            .toUpperCase(), // Get only the first 3 letters of the "Evalue"
      )
      .filter(Boolean);

    // The final SKU structure
    each_variant.sku = `${productVariantSlug}-${propertyEvalues.join('-')}-${Date.now()}`;
  }

  // A function to shuffle an array using the Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private adjustFilters(queryBuilder: any, filters: any) {
    const { byCategory, available, gte, lte } = filters;

    // ------------------ دسته‌بندی ------------------
    let categoryArray = [];
    if (byCategory !== undefined) {
      categoryArray = Array.isArray(byCategory) ? byCategory : [byCategory];
    }

    if (categoryArray.length > 0) {
      this.validateCategoryFilter(categoryArray);
      queryBuilder = queryBuilder.andWhere(
        `EXISTS (
        SELECT 1
        FROM "productCategory" pc
        WHERE pc."productId" = product.id
        AND pc."categoryId" IN (:...categoryIds)
      )`,
        { categoryIds: categoryArray },
      );
    }

    // ------------------ قیمت ------------------
    if (gte !== undefined || lte !== undefined) {
      this.validatePriceFilters(gte, lte);

      if (gte !== undefined && lte !== undefined) {
        queryBuilder = queryBuilder.andWhere(
          'variant.price BETWEEN :minPrice AND :maxPrice',
          {
            minPrice: gte,
            maxPrice: lte,
          },
        );
      } else if (gte !== undefined) {
        queryBuilder = queryBuilder.andWhere('variant.price >= :minPrice', {
          minPrice: gte,
        });
      } else if (lte !== undefined) {
        queryBuilder = queryBuilder.andWhere('variant.price <= :maxPrice', {
          maxPrice: lte,
        });
      }
    }

    // ------------------ موجودی ------------------
    if (available !== undefined) {
      if (available) {
        queryBuilder = queryBuilder.andWhere('variant.stock > 0');
      } else {
        queryBuilder = queryBuilder.andWhere('variant.stock <= 0');
      }
    }

    // ------------------ فیلترهای داینامیک ------------------
    const dynamicProperties = Object.keys(filters).filter(
      (key) => !['byCategory', 'gte', 'lte', 'available'].includes(key),
    );

    if (dynamicProperties.length > 0) {
      dynamicProperties.forEach((propertyName, index) => {
        const values = Array.isArray(filters[propertyName])
          ? filters[propertyName]
          : [filters[propertyName]];

        this.validatePropertyFilters(propertyName, values);

        queryBuilder = queryBuilder.andWhere(
          new Brackets((qb) => {
            values.forEach((val, valIndex) => {
              qb.orWhere(
                `EXISTS (
                SELECT 1
                FROM "propertyProductVariant" ppv
                JOIN property p ON ppv."propertyId" = p.id
                JOIN "propertyValue" pv ON ppv."propertyValueId" = pv.id
                WHERE ppv."productVariantId" = variant.id
                AND p."Ename" = :propertyName${index}_${valIndex}
                AND pv."Evalue" = :propertyValue${index}_${valIndex}
              )`,
                {
                  [`propertyName${index}_${valIndex}`]: propertyName,
                  [`propertyValue${index}_${valIndex}`]: val,
                },
              );
            });
          }),
        );
      });
    }

    return queryBuilder;
  }

  private validatePriceFilters(gte?: number, lte?: number): void {
    if (gte !== undefined && gte < 0)
      throw new BadRequestException('gte (minimum price) cannot be negative');
    if (lte !== undefined && lte < 0)
      throw new BadRequestException('lte (maximum price) cannot be negative');
    if (gte !== undefined && lte !== undefined && gte > lte)
      throw new BadRequestException('gte cannot be greater than lte');
  }

  private validatePropertyFilters(
    propertyName: string,
    propertyValue: any,
  ): void {
    if (!propertyName || propertyValue === undefined || propertyValue === null)
      throw new BadRequestException(
        `Invalid property filter: ${propertyName} has invalid value`,
      );
  }

  private validateCategoryFilter(categories: any): void {
    if (
      !Array.isArray(categories) ||
      categories.length === 0 ||
      categories.some((id) => !Number.isInteger(id))
    )
      throw new BadRequestException(
        'byCategory must be a non-empty array of integers',
      );
  }

  private adjustOrder(queryBuilder: any, sort: Sort) {
    const order: any = {};

    if (sort === Sort.ASC) {
      order.createdAt = 'ASC';
    } else if (sort === Sort.CHEAP) {
      order.price = 'ASC';
    } else if (sort === Sort.DESC) {
      order.createdAt = 'DESC';
    } else if (sort === Sort.EXPENSIVE) {
      order.price = 'DESC';
    }

    Object.keys(order).forEach((key) => {
      queryBuilder = queryBuilder.orderBy(`variants.${key}`, order[key]);
    });
    return queryBuilder;
  }
}