import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from '../permission/permission.entity';
import { RoleInsertDTO } from './dtos/RoleInsert.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { };

    async insert(payload: RoleInsertDTO) {
        try {
            const newRole = this.roleRepository.create(payload);

            if (payload.permissionIds?.length > 0) {
                const permissions = await this.permissionRepository.find({
                    where: { id: In(payload.permissionIds) },
                });
                newRole.permissions = permissions;
            };

            return await this.roleRepository.save(newRole);
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };

    async update(payload: RoleInsertDTO, id: string) {
        try {
            const role = await this.roleRepository.findOne({
                where: { id },
                relations: ['permissions'],
            });

            if (!role)
                throw new HttpException('نقش موردنظر یافت نشد', HttpStatus.NOT_FOUND);

            role.name = payload.name;

            if (payload.permissionIds?.length > 0) {
                const permissions = await this.permissionRepository.find({
                    where: { id: In(payload.permissionIds) },
                });
                role.permissions = permissions;
            };

            return await this.roleRepository.save(role);
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };

    async findAll() {
        return await this.roleRepository.find({ relations: ['permissions'] });
    };

    async findOne(id: string) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!role)
            throw new HttpException('نقش موردنظر یافت نشد', HttpStatus.NOT_FOUND);

        return role;
    };

    async delete(id: string) {
        try {
            const role = await this.roleRepository.findOne({ where: { id } });

            if (!role)
                throw new HttpException('نقش موردنظر یافت نشد', HttpStatus.NOT_FOUND);

            return await this.roleRepository.remove(role);
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        };
    };

    async currentPermissions(userId: string): Promise<string[]> {
        try {
            // Load user with roles and their permissions
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['roles', 'roles.permissions'],
            });

            if (!user || !user.roles || user.roles.length === 0) return [];

            const allPermissions = user.roles.flatMap(role => role.permissions);

            // Remove duplicates by name using Set
            const uniquePermissionNames = Array.from(
                new Set(allPermissions.map(permission => permission.name))
            );

            return uniquePermissionNames;
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.EXPECTATION_FAILED);
        }
    };

};
