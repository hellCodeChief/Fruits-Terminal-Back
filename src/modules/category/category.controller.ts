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
import { CategoryService } from './category.service';
import { CategoryInsertDTO } from './dtos/categoryInsert.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/modules/files/files.service';
import { FileUsage } from 'src/modules/files/types/files.type';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { CategoryUpdateDTO } from './dtos/categoryUpdate.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('category')
@ApiBearerAuth('access-token')
export class CategoryController {
  private readonly usage: FileUsage = 'category';
  constructor(
    private readonly categoryService: CategoryService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  // @Permissions('category:read')
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Get('parents')
  findRoots() {
    return this.categoryService.findParentCategories();
  }

  @Get('/:id')
  // @Permissions('category:read-one')
  async findOne(@Param('id') id: number) {
    return await this.categoryService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('category:create')
  async insert(@Body() payload: CategoryInsertDTO) {
    if (payload.parentId) payload.isParent = false;

    return await this.categoryService.insert(payload);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('category:update')
  async update(@Param('id') id: number, @Body() payload: CategoryUpdateDTO) {
    return await this.categoryService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('category:soft-delete')
  async softDelete(@Param('id') id: number) {
    try {
      await this.categoryService.softDelete(id);
      return {
        message: 'Category successfully soft deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to soft delete category', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('hard-delete/:id')
  // @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('category:hard-delete')
  async hardDelete(@Param('id') id: string) {
    try {
      await this.categoryService.hardDelete(Number(id));
      await this.filesService.multiDelete(id, this.usage);
      return {
        message: 'Category successfully hard deleted',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to hard delete category', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('category:upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') targetId: number,
  ) {
    if (!file)
      throw new BadRequestException('لطفا فایل موردنظر خود را وارد کنید');

    // Check if targetId is valid
    const category = await this.categoryService.findOne(targetId);
    if (!category)
      throw new BadRequestException('شناسه ارسال شده معتبر نمیباشد');

    return await this.filesService.uploadFile(file, {
      targetId,
      usage: this.usage,
    });
  }
}
