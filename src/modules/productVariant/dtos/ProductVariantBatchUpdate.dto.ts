import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// کلاس برای ویژگی‌ها (props)
class VariantPropDTO {
  @IsNumber()
  propertyId: number;

  @IsNumber()
  propertyValueId: number;
}

// کلاس پایه برای یک واریانت تکی
class ProductVariantUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @Min(0)
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @Min(0)
  @IsNumber()
  price?: number;

  // حداقل سفارش به کیلو
  @IsOptional()
  @IsInt()
  @Min(1)
  minOrder?: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  taxPercentage?: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantPropDTO)
  props?: VariantPropDTO[];

  @IsOptional()
  @IsString()
  sku?: string | null;
}

export class VariantUpdateItemDTO extends ProductVariantUpdateDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}

export class ProductVariantBatchUpdateDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantUpdateItemDTO)
  variants: VariantUpdateItemDTO[];
}
