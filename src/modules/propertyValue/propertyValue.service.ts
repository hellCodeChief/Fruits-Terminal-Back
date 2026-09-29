import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyValueEntity } from './propertyValue.entity';
import { PropertyValueInsertDTO } from './dtos/propertyValueInsert.dto';
import { PropertyValueUpdateDTO } from './dtos/propertyValueUpdate.dto';

@Injectable()
export class PropertyValueService {
    constructor(
        @InjectRepository(PropertyValueEntity)
        private readonly propertyValueRepository: Repository<PropertyValueEntity>,
    ) { };

    async findAll() {
        try {
            return await this.propertyValueRepository.find({ relations: ['property'] });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async findOne(id: number) {
        try {
            return await this.propertyValueRepository.findOne({ where: { id }, relations: ['property'] });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async insert(payload: PropertyValueInsertDTO) {
        try {
            await this.propertyValueRepository.insert(payload);
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async update(id: number, payload: PropertyValueUpdateDTO) {
        try {
            const property = await this.propertyValueRepository.update({ id }, payload);
            if (!property)
                throw new NotFoundException('ویژگی موردنظر یافت نشد');

            return await this.propertyValueRepository.findBy({ id });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    async delete(id: number) {
        try {
            const property = await this.propertyValueRepository.findBy({ id });
            if (!property)
                throw new NotFoundException('مقدار ویژگی موردنظر یافت نشد');

            await this.propertyValueRepository.delete({ id });
            return { message: 'مقدار ویژگی با موفقیت حذف شد' };
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };
};
