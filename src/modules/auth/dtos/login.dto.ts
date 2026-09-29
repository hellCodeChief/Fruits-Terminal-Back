// src/modules/auth/dtos/login.dto.ts
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateIf } from "class-validator";

export class LoginDTO {
  @ValidateIf(o => !o.phone) // One of these must exist
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsPhoneNumber('IR')
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;
};
