import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';

export class UserUpdateDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'نام الزامی است' })
    firstName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
    lastName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'آدرس الزامی است' })
    address: string;

    @IsOptional()
    @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
    email: string;

    @IsOptional()
    @IsPhoneNumber('IR', { message: 'شماره همراه باید یک شماره معتبر ایرانی باشد' })
    @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
    phone: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;
};
