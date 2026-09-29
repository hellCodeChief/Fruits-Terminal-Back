import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
    @IsNotEmpty({ message: 'رمزعبور جدید الزامی است' })
    @IsString()
    @MinLength(6, { message: 'رمزعبور باید حداقل حاوی 6 کاراکتر باشد' })
    newPassword: string;
};
