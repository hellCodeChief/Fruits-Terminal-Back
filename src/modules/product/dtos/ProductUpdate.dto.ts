import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ProductUpdateDTO {
    @IsOptional()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "" || value === null || value === undefined) return undefined;
        return typeof value === "string" ? Number(value) : value;
    })
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    description?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
    })
    @IsString()
    @IsNotEmpty()
    slug?: string;

    @IsOptional()
    @Transform(({ value }) => toNumberArray(value))
    @IsArray()
    @IsNumber({}, { each: true })
    categoryIds?: number[];

    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    isActive?: boolean;
};

function toBoolean(value: unknown) {
    if (value === "" || value === null || value === undefined) return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
}

function toNumberArray(value: unknown) {
    if (value === "" || value === null || value === undefined) return undefined;
    if (Array.isArray(value)) return value.map((id) => Number(id));
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map((id) => Number(id));
        } catch {
            return trimmed
                .split(",")
                .map((id) => Number(id.trim()))
                .filter((id) => !Number.isNaN(id));
        }
    }
    return value;
}
