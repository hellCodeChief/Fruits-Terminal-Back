import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class Props {
  @IsNumber()
  propertyId: number;

  @IsNumber()
  propertyValueId: number;
}

export class VariantDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @Min(0)
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;

  @IsNumber()
  @Min(0)
  price: number;

  // حداقل سفارش به کیلو
  @IsInt()
  @Min(1)
  minOrder: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  discountPercentage: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  taxPercentage: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Props)
  props?: Props[];

  @IsOptional()
  @IsString()
  sku: string | null;
}

export class ProductVariantInsertDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantDTO)
  variants: VariantDTO[];
}
