import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CategoryUpdateDTO {
    @IsOptional()
    @IsString()
    desc: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    displayName: string | null;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsArray()
    propertyIds: Array<number>;
};