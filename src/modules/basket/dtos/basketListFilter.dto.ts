import {
    IsOptional,
    IsString,
} from "class-validator";
import { BasketStatusEnum } from "../basket.enum";

export class BasketListFilterDTO {
    @IsOptional()
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    status: BasketStatusEnum;
}