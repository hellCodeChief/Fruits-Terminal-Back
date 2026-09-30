import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/modules/category/category.entity';
import { FilesService } from 'src/modules/files/files.service';
import { Repository } from 'typeorm';
import { VitrineCreateDTO } from './dtos/vitrine-create.dto';
import { ProductEntity } from './product.entity';
import { VitrineEntryEntity } from './vitrine-entry.entity';

const NOTICE = 'حداقل یک جعبه · خرید خرد نداریم · پیکاپ از میدان';
const UNIT = 'کیلو';
const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;

function normalizePersianName(input: string): string {
  return (input ?? '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** Asia/Tehran calendar day. Iran is UTC+03:30 year-round, so the day starts at 20:30 UTC. */
function tehranDayRange(now = new Date()) {
  const shifted = new Date(now.getTime() + TEHRAN_OFFSET_MS);
  const start = new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - TEHRAN_OFFSET_MS,
  );
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function tehranDateLabel(now = new Date()) {
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);
}

@Injectable()
export class ProductVitrineService {
  constructor(
    @InjectRepository(VitrineEntryEntity)
    private readonly entries: Repository<VitrineEntryEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    private readonly filesService: FilesService,
  ) {}

  async today() {
    const rows = await this.latestEntries(tehranDayRange());
    const items = rows
      .map((row) => this.toCard(row))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return {
      stallName: process.env.STALL_NAME?.trim() || 'حجره',
      date: tehranDateLabel(),
      notice: NOTICE,
      items,
    };
  }

  async suggest(q: string) {
    const normalized = normalizePersianName(q);
    if (!normalized) return [];

    const products = await this.products
      .createQueryBuilder('product')
      .where(`product.normalizedName LIKE :q ESCAPE '\\'`, {
        q: `%${escapeLike(normalized)}%`,
      })
      .andWhere('product.deletedAt IS NULL')
      .orderBy('product.name', 'ASC')
      .take(8)
      .getMany();

    const rows = await this.latestEntries(
      undefined,
      products.map((product) => product.id),
    );
    const byProduct = new Map(rows.map((row) => [row.productId, row]));

    return products.map((product) => {
      const row = byProduct.get(product.id);
      return {
        productId: product.id,
        name: product.name,
        price: row ? Number(row.price) : null,
        unit: UNIT,
      };
    });
  }

  async create(dto: VitrineCreateDTO, file: Express.Multer.File) {
    if (!file?.buffer?.length || !file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('تصویر را انتخاب کنید');
    }

    const normalizedName = normalizePersianName(dto.name);
    if (!normalizedName) throw new BadRequestException('نام را وارد کنید');

    const category = await this.findCategory(dto.categoryId);
    const product = await this.findOrCreateProduct(normalizedName, category);

    let savedFile: { id: string };
    try {
      const uploaded = await this.filesService.uploadFile(file, {
        targetId: product.id,
        usage: 'product',
      });
      const fileRow = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!fileRow?.id) {
        throw new InternalServerErrorException('آپلود تصویر انجام نشد');
      }
      savedFile = fileRow;
    } catch (error) {
      if (product.createdNow) await this.products.delete(product.id);
      throw error;
    }

    const entry = await this.entries.save(
      this.entries.create({
        productId: product.id,
        price: dto.price,
        unit: UNIT,
        description: dto.description?.trim() || null,
        categoryId: category?.id ?? null,
        fileId: savedFile.id,
      }),
    );

    entry.product = product;
    entry.category = category;
    return this.toCard(entry);
  }

  /**
   * Latest row per product. Postgres DISTINCT ON (productId) with
   * ORDER BY productId, createdAt DESC. When `range` is set, only rows
   * inside the current Tehran day compete.
   */
  private async latestEntries(
    range?: { start: Date; end: Date },
    productIds?: number[],
  ) {
    if (productIds && productIds.length === 0) return [];

    const qb = this.entries
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.product', 'product')
      .leftJoinAndSelect('entry.category', 'category')
      .where('product.deletedAt IS NULL');

    if (range) {
      qb.andWhere('entry.createdAt >= :start AND entry.createdAt < :end', range);
    }
    if (productIds) {
      qb.andWhere('entry.productId IN (:...productIds)', { productIds });
    }

    return qb
      .distinctOn(['entry.productId'])
      .orderBy('entry.productId', 'ASC')
      .addOrderBy('entry.createdAt', 'DESC')
      .getMany();
  }

  private async findCategory(categoryId?: number) {
    if (!categoryId) return null;
    const category = await this.categories.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('دسته‌بندی پیدا نشد');
    return category;
  }

  private async findOrCreateProduct(
    normalizedName: string,
    category: CategoryEntity | null,
  ): Promise<ProductEntity & { createdNow?: boolean }> {
    let product = await this.products.findOne({
      where: { normalizedName },
      withDeleted: true,
    });

    if (product?.deletedAt) {
      product.deletedAt = null;
      product.isActive = true;
      if (!product.name) product.name = normalizedName;
      return this.products.save(product);
    }

    if (product) return product;

    const created = this.products.create({
      slug: `vitrine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: normalizedName,
      normalizedName,
      isActive: true,
      categories: category ? [category] : [],
    });

    try {
      const saved = await this.products.save(created);
      return Object.assign(saved, { createdNow: true });
    } catch (error) {
      if (!this.isUniqueViolation(error)) {
        throw new InternalServerErrorException('ثبت محصول انجام نشد');
      }
      const existing = await this.products.findOne({
        where: { normalizedName },
        withDeleted: true,
      });
      if (!existing) throw new InternalServerErrorException('ثبت محصول انجام نشد');
      return existing;
    }
  }

  private toCard(entry: VitrineEntryEntity) {
    return {
      id: entry.id,
      productId: entry.productId,
      name: entry.product?.name || '',
      price: Number(entry.price),
      unit: UNIT,
      description: entry.description ?? null,
      categoryId: entry.categoryId ?? null,
      categoryName: entry.category?.displayName ?? null,
      fileId: entry.fileId ?? null,
      createdAt: entry.createdAt,
    };
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }
}
