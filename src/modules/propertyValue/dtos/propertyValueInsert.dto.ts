import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PropertyValueInsertDTO {
    @IsNotEmpty()
    @IsString()
    Evalue: string;

    @IsNotEmpty()
    @IsString()
    Fvalue: string;

    @IsNotEmpty()
    @IsNumber()
    propertyId: number;
};