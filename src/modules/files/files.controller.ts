import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from 'src/modules/files/files.service';
import { FileUsage } from './types/files.type';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('files')
@ApiBearerAuth('access-token')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':uuid/:usage')
  async getFile(
    @Param('uuid') uuid: string,
    @Param('usage') usage: FileUsage,
    @Res() res: Response,
  ) {
    const file = await this.filesService.findOne(uuid);

    if (!file) {
      throw new HttpException(
        'فایل در پایگاه‌داده یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    let stream;
    try {
      stream = await this.filesService.getFile(file, usage);
    } catch (err) {
      throw new HttpException(
        err.message || 'خطا در دریافت فایل',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!stream || typeof stream.pipe !== 'function') {
      throw new HttpException(
        'فایل موجود نیست یا قابل ارسال نیست',
        HttpStatus.NOT_FOUND,
      );
    }

    const safeName = encodeURIComponent(file.fileName);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${safeName}`,
    );

    stream.pipe(res);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Delete(':uuid/:usage')
  @Permissions('file:delete')
  async delete(@Param('uuid') uuid: string, @Param('usage') usage: FileUsage) {
    const file = await this.filesService.findOne(uuid);
    if (!file) throw new HttpException('فایل یافت نشد', HttpStatus.NOT_FOUND);

    await this.filesService.delete(uuid, usage);
    return {
      message: 'حذف فایل با موفقیت انجام شد',
      statusCdoe: HttpStatus.OK,
    };
  }
}
