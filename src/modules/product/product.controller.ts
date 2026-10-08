import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductInsertDTO } from './dtos/ProductInsert.dto';
import { ProductUpdateDTO } from './dtos/ProductUpdate.dto';
import { FilesService } from 'src/modules/files/files.service';
import { FileUsage } from 'src/modules/files/types/files.type';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('product')
@ApiBearerAuth('access-token')
export class ProductController {
  private readonly usage: FileUsage = 'product';
  constructor(
    private readonly productService: ProductService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  // @Permissions('product:read')
  async findAll() {
    return await this.productService.findAll();
  }

  @Get('/:id')
  // @Permissions('product:read-one')
  async findOne(@Param('id') id: number) {
    return await this.productService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:create')
  async insert(@Body() payload: ProductInsertDTO) {
    const { categoryIds, ...productPayload } = payload;
    return await this.productService.insert(productPayload, categoryIds);
  }

  @Put('/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:update')
  async update(@Body() payload: ProductUpdateDTO, @Param('id') id: number) {
    return await this.productService.update(payload, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:soft-delete')
  async softDelete(@Param('id') id: number) {
    try {
      await this.productService.softDelete(id);
      return {
        message: 'Product successfully soft deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to soft delete product', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('hard-delete/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:hard-delete')
  async hardDelete(@Param('id') id: string) {
    const product = await this.productService.findOne(Number(id));
    try {
      // ✅ عکس‌ها قبل از حذف ردیف؛ CASCADE بعد از آن ردیف files را پاک می‌کند
      await this.filesService.multiDelete(String(id), this.usage);
      for (const varaint of product?.variants ?? [])
        await this.filesService.multiDelete(
          String(varaint.id),
          'product-variant',
        );
      await this.productService.hardDelete(Number(id));

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
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') targetId: number,
  ) {
    if (!file)
      throw new BadRequestException('لطفا فایل موردنظر خود را وارد کنید');

    // Check if targetId is valid
    const product = await this.productService.findOne(targetId);
    if (!product)
      throw new BadRequestException('شناسه ارسال شده معتبر نمیباشد');

    return await this.filesService.uploadFile(file, {
      targetId,
      usage: this.usage,
    });
  }
}
