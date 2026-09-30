import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { VitrineCreateDTO } from './dtos/vitrine-create.dto';
import { StallStaffGuard } from './stall-staff.guard';
import { VitrineService } from './vitrine.service';

@Controller('vitrine')
export class VitrineController {
  constructor(private readonly vitrineService: VitrineService) {}

  @Get('today')
  today() {
    return this.vitrineService.today();
  }

  @Get('suggest')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, StallStaffGuard)
  suggest(@Query('q') q?: string) {
    return this.vitrineService.suggest(q ?? '');
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, StallStaffGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }),
  )
  create(
    @Body() payload: VitrineCreateDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('تصویر را انتخاب کنید');
    return this.vitrineService.create(payload, file);
  }
}
