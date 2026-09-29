import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
} from 'class-validator';

export class UserInsertDTO {
    @IsString()
    @IsOptional()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
    @IsOptional()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'رمزعبور باید حداقل حاوی 6 کاراکتر باشد' })
    password: string;

    @IsPhoneNumber('IR', { message: 'شماره همراه باید یک شماره معتبر ایرانی باشد' })
    @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
    phone: string;

    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    accountType?: 'customer' | 'admin';

    @IsOptional()
    roleId?: string;
};
