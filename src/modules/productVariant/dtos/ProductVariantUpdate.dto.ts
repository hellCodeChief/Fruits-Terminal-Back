import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class ProductVariantUpdateDTO {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
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

    @IsOptional()
    @Min(0)
    @IsNumber()
    price: number;

    @IsOptional()
    @Min(0)
    @Max(100)
    @IsNumber()
    discountPercentage: number;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsOptional()
    @ArrayNotEmpty()
    @IsArray()
    props: Array<Props>;
};

class Props {
    @IsNumber()
    propertyId: number;
    @IsNumber()
    propertyValueId: number;
};