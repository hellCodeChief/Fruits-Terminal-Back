import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { ProductVitrineService } from './product-vitrine.service';
import { VitrineCreateDTO } from './dtos/vitrine-create.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

const STAFF_ROLES = new Set(['admin', 'worker']);

function assertStaff(user?: { accountType?: string; roles?: { name?: string }[] }) {
  if (!user) throw new ForbiddenException('شما دسترسی لازم را ندارید');
  if (user.accountType === 'admin') return;
  const names = (user.roles ?? []).map((role) =>
    String(role?.name ?? '')
      .trim()
      .toLowerCase(),
  );
  if (names.some((name) => STAFF_ROLES.has(name))) return;
  throw new ForbiddenException('فقط مدیر یا کارگر می‌تواند در ویترین ثبت کند');
}

@Controller('product')
@ApiBearerAuth('access-token')
export class ProductController {
  private readonly usage: FileUsage = 'product';
  constructor(
    private readonly productService: ProductService,
    private readonly filesService: FilesService,
    private readonly vitrineService: ProductVitrineService,
  ) {}

  @Get()
  // @Permissions('product:read')
  async findAll() {
    return await this.productService.findAll();
  }

  @Get('vitrine/today')
  today() {
    return this.vitrineService.today();
  }

  @Get('vitrine/suggest')
  @UseGuards(AuthGuard)
  suggest(
    @Req() req: { user?: { accountType?: string; roles?: { name?: string }[] } },
    @Query('q') q?: string,
  ) {
    assertStaff(req.user);
    return this.vitrineService.suggest(q ?? '');
  }

  @Post('vitrine')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }),
  )
  create(
    @Req() req: { user?: { accountType?: string; roles?: { name?: string }[] } },
    @Body() payload: VitrineCreateDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertStaff(req.user);
    if (!file) throw new BadRequestException('تصویر را انتخاب کنید');
    return this.vitrineService.create(payload, file);
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
      await this.productService.hardDelete(Number(id));
      await this.filesService.multiDelete(String(id), this.usage);

      for (const varaint of product.variants)
        await this.filesService.multiDelete(
          String(varaint.id),
          'product-variant',
        );

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
