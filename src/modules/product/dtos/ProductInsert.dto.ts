import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProductInsertDTO {
    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsArray()
    categoryIds: Array<number>;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;
};