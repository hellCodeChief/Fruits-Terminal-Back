import { CategorySubscriber } from 'src/modules/category/subscriber/category.subscriber';
import { ProductSubscriber } from 'src/modules/product/subscriber/product.subscriber';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [
    join(__dirname, 'migrations', '*.migrations.{ts,js}'),
    join(__dirname, '..', 'migrations', '*.migrations.{ts,js}'),
    join(__dirname, '..', '**', 'migrations', '*.{ts,js}'),
  ],
  subscribers: [CategorySubscriber, ProductSubscriber],
  migrationsRun: false,
  logging: false,
  synchronize: false,
});

export default AppDataSource;
