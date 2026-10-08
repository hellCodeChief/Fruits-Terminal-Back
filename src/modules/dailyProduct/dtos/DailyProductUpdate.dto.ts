import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class DailyProductUpdateDTO {
    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    minOrder?: number;

    @IsOptional()
    @IsString()
    desc?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
