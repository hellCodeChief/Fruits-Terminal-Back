import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RoleInsertDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    color: string;

    @IsOptional()
    @IsArray()
    permissionIds: string[];
};