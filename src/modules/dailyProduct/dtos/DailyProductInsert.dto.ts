import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class DailyProductInsertDTO {
    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsNumber()
    @Min(1)
    price: number;

    @IsInt()
    @Min(1)
    minOrder: number;

    @IsOptional()
    @IsString()
    desc?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
