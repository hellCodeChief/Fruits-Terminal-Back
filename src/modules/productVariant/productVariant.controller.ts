import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUsage } from 'src/modules/files/types/files.type';
import { FilesService } from 'src/modules/files/files.service';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { ProductVariantService } from './productVariant.service';
import { ProductVariantInsertDTO } from './dtos/ProductVariantInsert.dto';
import { ProductVariantUpdateDTO } from './dtos/ProductVariantUpdate.dto';
import { ProductVariantBatchUpdateDTO } from './dtos/ProductVariantBatchUpdate.dto';
import { Sort } from './productVariant.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetProductsQueryDto } from './dtos/ProductVariantFindAll.dto';

@Controller('product-variant')
@ApiBearerAuth('access-token')
export class ProductVariantController {
  private readonly usage: FileUsage = 'product-variant';
  constructor(
    private readonly productVariantService: ProductVariantService,
    private readonly filesService: FilesService,
  ) { }

  @Get()
  async findAll(@Query() query: GetProductsQueryDto) {
    const filters: any = {};
    const {
      byCategory,
      gte,
      lte,
      available,
      page,
      page_size,
      sort: sortParam,
    } = query;

    if (byCategory) {
      filters.byCategory = byCategory.split(',').map(Number);
    }

    if (gte) filters.gte = Number(gte);
    if (lte) filters.lte = Number(lte);

    if (available !== undefined) {
      filters.available = available === 'true';
    }

    const sortMap = {
      asc: Sort.ASC,
      desc: Sort.DESC,
      cheap: Sort.CHEAP,
      expensive: Sort.EXPENSIVE,
      'mostly-visited': Sort.MOSTLY_VISITED,
    };

    const sort = sortMap[sortParam] ?? Sort.ASC;

    return this.productVariantService.findAll(
      filters,
      sort,
      { page, page_size },
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:read-one')
  async findOne(@Param('id') id: number) {
    return await this.productVariantService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:create')
  async insert(@Body() payload: ProductVariantInsertDTO) {
    return await this.productVariantService.insert(payload.variants);
  }

  @Put('/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:update')
  async update(
    @Body() payload: ProductVariantUpdateDTO,
    @Param('id') id: number,
  ) {
    return await this.productVariantService.update(payload, id);
  }

  @Patch('/batch')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:update')
  async updateMany(@Body() payload: ProductVariantBatchUpdateDTO) {
    return await this.productVariantService.updateMany(payload.variants);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:soft-delete')
  async softDelete(@Param('id') id: number) {
    try {
      await this.productVariantService.softDelete(id);
      return {
        message: 'ProductVariant successfully soft deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to soft delete productVariant', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('hard-delete/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('variant:hard-delete')
  async hardDelete(@Param('id') id: string) {
    try {
      // ✅ عکس تنوع قبل از حذف ردیف؛ CASCADE بعد از آن ردیف files را پاک می‌کند
      await this.filesService.multiDelete(id, this.usage);
      await this.productVariantService.hardDelete(Number(id));
      return {
        message: 'ProductVariant successfully hard deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to hard delete ProductVariant', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload/:id')
  @Permissions('variant:upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') targetId: number,
  ) {
    if (!file)
      throw new BadRequestException('لطفا فایل موردنظر خود را وارد کنید');

    // Check if targetId is valid
    const pv = await this.productVariantService.findOne(targetId);
    if (!pv) throw new BadRequestException('شناسه ارسال شده معتبر نمیباشد');

    return await this.filesService.uploadFile(file, {
      targetId,
      usage: this.usage,
    });
  }
}
