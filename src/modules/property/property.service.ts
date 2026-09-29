
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyInsertDTO } from './dtos/propertyInsert.dto'
import { PropertyUpdateDTO } from './dtos/propertyUpdate.dto';
import { PropertyEntity } from './property.entity';


@Injectable()
export class PropertyService {
    constructor(
        @InjectRepository(PropertyEntity)
        private readonly propertyRepository: Repository<PropertyEntity>
    ) { };

    async findAll() {
        try {
            return await this.propertyRepository.find({
                relations: ['propertyValues'],
                order: {
                    createdAt: 'DESC', // Sort by createdAt descending (newest first)
                },
            });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async findOne(id: number) {
        try {
            return await this.propertyRepository.find({
                where: { id },
                relations: ['propertyValues'],
                order: {
                    createdAt: 'DESC', // Sort by createdAt descending (newest first)
                },
            });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async insert(payload: PropertyInsertDTO) {
        try {
            const property = this.propertyRepository.create(payload);
            return await this.propertyRepository.save(property);
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async update(id: number, payload: PropertyUpdateDTO) {
        try {
            const property = await this.propertyRepository.update({ id }, payload);
            if (!property)
                throw new NotFoundException('ویژگی موردنظر یافت نشد');

            return await this.propertyRepository.findBy({ id });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async delete(id: number) {
        try {
            const property = await this.propertyRepository.findBy({ id });
            if (!property)
                throw new NotFoundException('ویژگی موردنظر یافت نشد');

            await this.propertyRepository.delete({ id });
            return { message: 'ویژگی با موفقیت حذف شد' };
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };
};
