import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

function blankToUndefined(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

function toPrice(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const raw = String(value)
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[,\s]/g, '');
  if (raw === '') return undefined;
  return Number(raw);
}

export class VitrineCreateDTO {
  @IsString()
  @IsNotEmpty({ message: 'نام را وارد کنید' })
  @MaxLength(80, { message: 'نام خیلی طولانی است' })
  name: string;

  @Transform(({ value }) => toPrice(value))
  @IsInt({ message: 'قیمت باید عدد باشد' })
  @Min(1, { message: 'قیمت را وارد کنید' })
  price: number;

  @Transform(({ value }) => {
    const next = blankToUndefined(value);
    return typeof next === 'string' ? next.trim() : next;
  })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'توضیح خیلی طولانی است' })
  description?: string;

  @Transform(({ value }) => {
    const next = blankToUndefined(value);
    if (next === undefined) return undefined;
    return Number(next);
  })
  @IsOptional()
  @IsInt({ message: 'دسته‌بندی نامعتبر است' })
  categoryId?: number;
}
