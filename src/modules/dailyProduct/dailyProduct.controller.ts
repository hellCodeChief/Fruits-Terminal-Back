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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { FilesService } from 'src/modules/files/files.service';
import { FileUsage } from 'src/modules/files/types/files.type';
import { DailyProductService } from './dailyProduct.service';
import { DailyProductInsertDTO } from './dtos/DailyProductInsert.dto';
import { DailyProductUpdateDTO } from './dtos/DailyProductUpdate.dto';

@Controller('daily-product')
@ApiBearerAuth('access-token')
export class DailyProductController {
  private readonly usage: FileUsage = 'daily-product';

  constructor(
    private readonly dailyProductService: DailyProductService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  async findAll() {
    return await this.dailyProductService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.dailyProductService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:create')
  async insert(@Body() payload: DailyProductInsertDTO) {
    return await this.dailyProductService.insert(payload);
  }

  @Put('/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:update')
  async update(@Body() payload: DailyProductUpdateDTO, @Param('id') id: number) {
    return await this.dailyProductService.update(payload, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:soft-delete')
  async softDelete(@Param('id') id: number) {
    try {
      await this.dailyProductService.softDelete(id);
      return {
        message: 'Daily product successfully soft deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to soft delete daily product', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('hard-delete/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('product:hard-delete')
  async hardDelete(@Param('id') id: string) {
    try {
      // ✅ عکس‌ها قبل از حذف ردیف؛ CASCADE بعد از آن ردیف files را پاک می‌کند
      await this.filesService.multiDelete(String(id), this.usage);
      await this.dailyProductService.hardDelete(Number(id));

      return {
        message: 'Daily product successfully hard deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to hard delete daily product', error },
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

    const row = await this.dailyProductService.findOne(targetId);
    if (!row)
      throw new BadRequestException('شناسه ارسال شده معتبر نمیباشد');

    return await this.filesService.uploadFile(file, {
      targetId,
      usage: this.usage,
    });
  }
}
