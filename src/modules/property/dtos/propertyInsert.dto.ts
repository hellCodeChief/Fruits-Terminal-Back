import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PropertyType } from '../types/propery.type';

export class PropertyInsertDTO {
  @IsString()
  Ename: string;

  @IsString()
  Fname: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsEnum(PropertyType)
  type: PropertyType;
}
