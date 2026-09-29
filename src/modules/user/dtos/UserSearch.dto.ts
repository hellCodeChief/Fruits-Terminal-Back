import {
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';

export class UserSearchDTO {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'ایمیل نامعتبر است' })
    email?: string;

    @IsOptional()
    @IsPhoneNumber('IR', { message: 'شماره همراه باید یک شماره معتبر ایرانی باشد' })
    phone?: string;

    @IsOptional()
    @IsString()
    accountType?: 'customer' | 'admin';

    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    isEmailVerified?: boolean;

    @IsOptional()
    isPhoneVerified?: boolean;
};
