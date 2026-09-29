import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryClosureEntity } from 'src/modules/category/categoryClosure/categoryClosure.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import { PropertyEntity } from '../property/property.entity';
import { CategoryEntity } from './category.entity';
import { CategoryInsertDTO } from './dtos/categoryInsert.dto';
import { CategoryUpdateDTO } from './dtos/categoryUpdate.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(CategoryClosureEntity)
    private readonly categoryClosureRepository: Repository<CategoryClosureEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll() {
    return await this.categoryRepository.find({
      where: { deletedAt: null },
      relations: [
        'childCategories',
        'childCategories.parentCategory',
        'parentCategories',
        'parentCategories.childCategory',
        'properties',
        'files',
      ],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }
  //   parentCategories
  async findParentCategories() {
    return this.categoryRepository.find({
      where: { deletedAt: null, isParent: true },
      relations: [
        'childCategories',
        'childCategories.childCategory',
        'properties',
        'files',
      ],
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({
      where: { id, deletedAt: null },
      relations: [
        'childCategories',
        'childCategories.parentCategory',
        'parentCategories',
        'parentCategories.childCategory',
      ],
    });
  }

  async insert(payload: CategoryInsertDTO) {
    try {
      const category = this.categoryRepository.create(payload);

      const properties = await this.propertyRepository.findBy({
        id: In(payload.propertyIds),
      });
      if (properties.length > 0) category.properties = properties;

      category.parentId = payload?.parentId;
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, payload: CategoryUpdateDTO) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['properties'],
      });
      if (!category)
        throw new HttpException(
          'دسته بندی موردنظر یافت نشد',
          HttpStatus.NOT_FOUND,
        );

      if (payload.displayName !== undefined)
        category.displayName = payload.displayName;
      if (payload.desc !== undefined) category.desc = payload.desc;
      if (payload.isActive !== undefined) category.isActive = payload.isActive;
      const properties = await this.propertyRepository.findBy({
        id: In(payload.propertyIds),
      });
      if (properties.length > 0) category.properties = properties;

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category)
      throw new HttpException(
        'دسته بندی موردنظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );

    try {
      await this.categoryRepository.softDelete(id);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async hardDelete(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['properties'],
    });
    if (!category)
      throw new HttpException(
        'دسته بندی موردنظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );

    try {
      // Remove category from categoryClosure
      const childIds = await this.categoryClosureRepository.find({
        where: { parentId: id },
        select: ['childId'],
      });
      const deletableChildIds = childIds.map((c) => c.childId).flat(Infinity);

      // Unlink properties and products before delete
      for (const catId of deletableChildIds) {
        const each_category = await this.categoryRepository.findOne({
          where: { id: catId },
          relations: ['properties', 'products'],
          select: ['properties', 'products', 'id'],
        });
        if (each_category.properties && each_category.properties.length > 0) {
          await this.categoryRepository
            .createQueryBuilder()
            .relation(CategoryEntity, 'properties')
            .of(catId)
            .remove(each_category.properties.map((p) => p.id));
        }
        if (each_category.products && each_category.products.length > 0) {
          const prodIds = each_category.products.map((p) => p.id);

          await this.categoryRepository
            .createQueryBuilder()
            .relation(CategoryEntity, 'products')
            .of(catId)
            .remove(prodIds);

          // Assign no category products to noCats category(initiated cat)
          const remainingProducts = await this.productRepository.find({
            where: { id: In(prodIds) },
            relations: ['categories'],
            select: ['categories', 'id'],
          });
          const noCategoryProducts = remainingProducts.filter(
            (p) => p.categories.length === 0,
          );
          const initCategory = await this.categoryRepository.findOneBy({
            slug: 'noCats',
          });
          for (const p of noCategoryProducts) {
            await this.productRepository
              .createQueryBuilder()
              .relation(ProductEntity, 'categories')
              .of(p.id)
              .add(initCategory.id);
          }
        }
      }

      await this.categoryRepository.delete({ id: In(deletableChildIds) });
      await this.categoryClosureRepository.delete({
        childId: In(deletableChildIds),
      });
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
