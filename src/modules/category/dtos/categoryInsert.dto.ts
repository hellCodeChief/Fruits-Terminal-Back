import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CategoryInsertDTO {
    @IsNotEmpty()
    isParent: boolean;

    @IsOptional()
    @IsString()
    desc: string | null;

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    displayName: string | null;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsNumber()
    parentId: number | null;

    @ArrayNotEmpty()
    @IsArray()
    propertyIds: Array<number>;
};

// {
//     "isParent": true,
//     "slug": "cat1",
//     "displayName": "cat1",
//     "propertyIds": [1,2,3,4,5],
//     "isActive": true
//     // "parentId": 
// }