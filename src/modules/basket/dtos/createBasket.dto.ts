import { Type } from "class-transformer";
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    Min,
    ValidateNested,
} from "class-validator";

export class BasketInsertDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemsDTO)
    items?: Array<ItemsDTO>;
}

class ItemsDTO {
    @IsNumber()
    @IsNotEmpty()
    productVariantId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'quantity must be at least 1' })
    quantity: number;
}
