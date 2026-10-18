import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DailyProductEntity } from './dailyProduct.entity';
import { DailyProductInsertDTO } from './dtos/DailyProductInsert.dto';
import { DailyProductUpdateDTO } from './dtos/DailyProductUpdate.dto';

@Injectable()
export class DailyProductService {
  constructor(
    @InjectRepository(DailyProductEntity)
    private readonly dailyProductRepository: Repository<DailyProductEntity>,
  ) {}

  async findAll() {
    const rows = await this.dailyProductRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['files'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.asCard(row));
  }

  async findOne(id: number) {
    const row = await this.dailyProductRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['files'],
    });
    return row ? this.asCard(row) : null;
  }

  // ✅ فقط ردیف جدید؛ ردیف‌های دیگر دست نمی‌خورند
  async insert(payload: DailyProductInsertDTO) {
    try {
      const row = this.dailyProductRepository.create(payload);
      const saved = await this.dailyProductRepository.save(row);
      return await this.findOne(saved.id);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(payload: DailyProductUpdateDTO, id: number) {
    const current = await this.dailyProductRepository.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!current) throw new NotFoundException('محصول روز یافت نشد');

    try {
      await this.dailyProductRepository.update({ id }, payload);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: number) {
    const row = await this.dailyProductRepository.findOneBy({ id });
    if (!row)
      throw new HttpException('محصول روز یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.dailyProductRepository.softDelete(id);
    } catch (error) {
      throw new HttpException(
        { message: 'شکست در حذف نرم محصول روز', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async hardDelete(id: number) {
    const row = await this.dailyProductRepository.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!row)
      throw new HttpException('محصول روز یافت نشد', HttpStatus.NOT_FOUND);

    try {
      await this.dailyProductRepository.delete(id);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ کارت روزانه قیمت و عکس را از تنوع می‌خواند
  private asCard(row: DailyProductEntity) {
    const files = row.files ?? [];
    return {
      id: row.id,
      isActive: row.isActive,
      slug: row.slug,
      defaultVariantId: row.defaultVariantId,
      price: row.price,
      minOrder: row.minOrder,
      desc: row.desc,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      files,
      variants: [
        {
          id: row.id,
          price: row.price,
          minOrder: row.minOrder,
          desc: row.desc,
          createdAt: row.createdAt,
          isActive: row.isActive,
          files,
        },
      ],
    };
  }
}
