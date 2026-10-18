import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'minio';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { FileEntity } from './files.entity';
import { FileUsage } from './types/files.type';

@Injectable()
export class FilesService {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Client,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  // targetId can be categoryId or variantId
  async uploadFile(file: Express.Multer.File, { targetId, usage }) {
    const { originalname, mimetype, size, buffer } = file;
    const ext = extname(originalname);
    const createFilePayload = this.createFilePayload({
      originalname,
      mimetype,
      size,
      ext,
      targetId,
      usage,
    });

    // Create Bucket if it does not exist
    const bucketExists = await this.minioClient.bucketExists(usage);
    if (!bucketExists) {
      await this.minioClient.makeBucket(usage, 'us-east-1');
    }

    try {
      // Save in DB
      const newFile = this.fileRepository.create(createFilePayload);
      const savedFile = await this.fileRepository.save(newFile);
      //@ts-ignore
      const fileId = newFile.id;

      // Upload in MinIO
      await this.minioClient.putObject(usage, fileId, buffer);

      return savedFile;
    } catch (err) {
      throw new InternalServerErrorException('شکست در آپلود فایل', err.message);
    }
  }

  async getFile(file: FileEntity, usage: FileUsage) {
    try {
      return await this.minioClient.getObject(usage, file.id);
    } catch (err) {
      console.warn(
        `فایل در MinIO یافت نشد. usage: ${usage}, fileId: ${file.id}`,
      );
      if (
        err.code === 'NoSuchKey' ||
        err.message.includes('The specified key does not exist')
      ) {
        throw new InternalServerErrorException(
          'فایل در فضای ذخیره‌سازی یافت نشد',
        );
      }
      throw new InternalServerErrorException(
        'خطا در دریافت فایل از فضای ذخیره‌سازی',
        err.message,
      );
    }
  }

  async findOne(id: string) {
    return await this.fileRepository.findOne({ where: { id } });
  }

  async delete(id: string, usage: FileUsage) {
    try {
      await this.removeStoredObject(usage, id);
      await this.fileRepository.delete(id);
    } catch (err) {
      throw new InternalServerErrorException(
        'فایل موردنظر یافت نشد',
        err.message,
      );
    }
  }

  async multiDelete(targetId: string, usage: FileUsage) {
    const where: any = { usage };
    switch (usage) {
      case 'category':
        where.categoryId = String(targetId);
        break;
      case 'product-variant':
        where.variantId = String(targetId);
        break;
      case 'product':
        where.productId = String(targetId);
        break;
      case 'daily-product':
        where.dailyProductId = String(targetId);
        break;
    }

    const files = await this.fileRepository.find({ where });
    try {
      for (const file of files) {
        await this.removeStoredObject(usage, file.id);
        await this.fileRepository.delete(file.id);
      }
    } catch (err) {
      throw new InternalServerErrorException('شکست در حذف فایل', err.message);
    }
  }

  // ✅ نبودن آبجکت در MinIO مانع حذف ردیف files نمی‌شود
  private async removeStoredObject(usage: FileUsage, id: string) {
    try {
      await this.minioClient.removeObject(usage, id);
    } catch (err) {
      if (this.objectAlreadyGone(err)) return;
      throw err;
    }
  }

  private objectAlreadyGone(err: { code?: string; name?: string; message?: string }) {
    const code = err?.code || err?.name;
    const message = err?.message || '';
    return (
      code === 'NoSuchKey' ||
      code === 'NotFound' ||
      message.includes('The specified key does not exist')
    );
  }

  // PRIVATE METHODS
  private createFilePayload({
    originalname,
    mimetype,
    size,
    ext,
    targetId,
    usage,
  }) {
    const createFilePayload: any = {
      fileName: originalname,
      mimeType: mimetype,
      size,
      usage,
      ext,
    };

    switch (usage) {
      case 'category':
        createFilePayload.categoryId = targetId;
        break;
      case 'product-variant':
        createFilePayload.variantId = targetId;
        break;
      case 'product':
        createFilePayload.productId = targetId;
        break;
      case 'daily-product':
        createFilePayload.dailyProductId = targetId;
        break;
    }

    return createFilePayload;
  }
}
