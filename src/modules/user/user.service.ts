import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import HashClass from 'src/common/utils/crypto.util';
import { RoleEntity } from 'src/modules/role/role.entity';
import { UserEntity } from './user.entity';
import { UserInsertDTO } from './dtos/UserInsert.dto';
import { UserUpdateDTO } from './dtos/UserUpdate.dto';
import { AssignRoleDTO } from './dtos/AssignRole.dto';
import { UserSearchDTO } from './dtos/UserSearch.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
    ) { }

    async insertUser(userInsertData: UserInsertDTO) {
        try {
            const newUser = this.userRepository.create(userInsertData);
            await this.userRepository.save(newUser);

            const { password, token, ...createdUser } = newUser;
            return createdUser;
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };

    async updateUser(userUpdateData: UserUpdateDTO, id: string): Promise<UserEntity> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) 
                throw new NotFoundException('کاربر موردنظر یافت نشد');

            Object.assign(user, userUpdateData);

            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            throw new HttpException(
                { message: error.message || 'خطایی در به‌روزرسانی کاربر رخ داد' },
                error.status || HttpStatus.EXPECTATION_FAILED,
            );
        };
    };

    async assignRole(assignRoleData: AssignRoleDTO, id: string) {
        try {
            const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
            if (!user)
                throw new NotFoundException('کاربر موردنظر یافت نشد');

            // Remove all roles if there is no role inside the array
            if (assignRoleData.roleId.length === 0) {
                user.roles = [];
                await this.userRepository.save(user);
                return { status: 200, message: 'نقشهای کاربر با موفقیت بروزرسانی شدند', data: user };
            };

            // Checking for roles
            const roles = await this.roleRepository.find({
                where: assignRoleData.roleId.map((roleId) => ({ id: roleId })),
            });
            if (roles.length !== assignRoleData.roleId.length) {
                const foundRoleIds = roles.map((role) => role.id);
                const missingRoleIds = assignRoleData.roleId.filter(
                    (roleId) => !foundRoleIds.includes(roleId),
                );
                throw new NotFoundException(`نقش‌هایی با آیدی‌های ${missingRoleIds.join(', ')} یافت نشدند`);
            };

            // Sync the roles
            user.roles = roles;
            await this.userRepository.save(user);
            return { status: 200, message: 'نقشهای کاربر با موفقیت بروزرسانی شدند', data: user };
        } catch (error) {
            throw new HttpException(
                { message: error.message || 'خطایی در اختصاص نقش رخ داد' },
                error.status || HttpStatus.EXPECTATION_FAILED,
            );
        };
    };

    async find(searchObject: UserSearchDTO) {
        return await this.userRepository.find({ where: searchObject });
    };

    async findAll() {
        return await this.userRepository.find();
    };

    async findById(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('کاربر موردنظر یافت نشد');
        return user;
    };

    async getProfile(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isEmailVerified: true,
                isPhoneVerified: true,
                accountType: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
            relations: ['roles', 'roles.permissions']
        });
        if (!user) throw new NotFoundException('کاربر موردنظر یافت نشد');
        return user;
    };

    async changePassword(id: string, newPassword: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });
        if (!user) throw new NotFoundException('کاربر موردنظر یافت نشد');

        const salt = HashClass.generateRandomSalt();
        const hashedPassword = HashClass.makeHash(newPassword, salt);

        await this.userRepository.update({ id }, { password: hashedPassword });
        return { message: 'رمزعبور با موفقیت بروزرسانی شد' };
    };

    async updateLastLogin(id: string) {
        return await this.userRepository.update({ id }, { lastLogin: new Date() });
    };

    async findOneByEmail(email: string): Promise<Pick<UserEntity, 'id' | 'isActive' | 'password' | 'salt'>> {
        return await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                isActive: true,
                password: true,
                salt: true,
            },
        });
    };

    async findOneByPhone(phone: string): Promise<Pick<UserEntity, 'id' | 'isActive' | 'password' | 'salt'>> {
        return await this.userRepository.findOne({
            where: { phone },
            select: {
                id: true,
                isActive: true,
                password: true,
                salt: true,
            }
        });
    };

    async delete(id: string) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) throw new NotFoundException('کاربر موردنظر یافت نشد');

            await this.userRepository.delete({ id });
            return { message: 'کاربر با موفقیت حذف شد' };
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };

    async updateToken(id: string, token: string | null) {
        try {
            return await this.userRepository.update({ id }, { token });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };
};
