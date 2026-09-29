import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ProductUpdateDTO {
    @IsOptional()
    @IsString()
    slug: string;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;
};