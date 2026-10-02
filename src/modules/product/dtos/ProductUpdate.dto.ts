import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductUpdateDTO {
    @IsOptional()
    @IsString()
    slug: string;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    // ✅ همان دسته‌ای که افزودن ساده می‌نویسد
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    categoryIds?: number[];
};