import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserModule } from 'src/modules/user/user.module';
import appConfig from './config/app.config';
import AppDataSource from './database/database.config';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductVariantModule } from './modules/productVariant/productVariant.module';
import { PropertyModule } from './modules/property/property.module';
import { PropertyValueModule } from './modules/propertyValue/propertyValue.module';
import { PropertyProductVariantModule } from './modules/propertyProductVariant/propertyProductVariant.module';
import { PropertyValueEntity } from './modules/propertyValue/propertyValue.entity';
import { CategoryEntity } from './modules/category/category.entity';
import { FilesModule } from './modules/files/files.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { BasketModule } from './modules/basket/basket.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PermissionEntity } from './modules/permission/permission.entity';
import { UserEntity } from './modules/user/user.entity';
import { PropertyEntity } from './modules/property/property.entity';
import { PropertyValueController } from './modules/propertyValue/propertyValue.controller';


@Module({
  imports: [
    // The ConfigModule is configured to load environment variables globally
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
      load: [appConfig], // Load additional configuration files if any
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    // handle the limitation of requests
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 sec
        limit: 30, // 3 req per 1 sec
      },
      {
        name: 'long',
        ttl: 60000, // 1 min
        limit: 300, // 100 req per 1 min
      },
    ]),
    TypeOrmModule.forFeature([PropertyEntity, PropertyValueEntity, CategoryEntity, PermissionEntity, UserEntity]), // Need this line to use entities in seeder
    UserModule,
    AuthModule,
    RoleModule,
    ProductModule,
    CategoryModule,
    ProductVariantModule,
    PropertyModule,
    PropertyValueModule,
    PropertyProductVariantModule,
    FilesModule,
    BasketModule,
    InvoiceModule,
    PaymentModule,
  ],
  controllers: [
    PropertyValueController,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
