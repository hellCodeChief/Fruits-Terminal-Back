import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoryEntity } from "src/modules/category/category.entity";
import { ProductVariantEntity } from "src/modules/productVariant/productVariant.entity";
import { ProductEntity } from "src/modules/product/product.entity";
import { DailyProductEntity } from "src/modules/dailyProduct/dailyProduct.entity";
import { FileUsage } from "./types/files.type";

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  fileName: string;

  @Column()
  size: number;

  @Column()
  ext: string;

  @Column()
  mimeType: string; // image/jpeg, application/pdf

  @Column({ type: 'varchar' })
  usage: FileUsage;

  @CreateDateColumn()
  createdAt: Date;

  // RELATIONS
  @Column({ nullable: true })
  @Index()
  categoryId: number;

  @ManyToOne(() => CategoryEntity, category => category.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ nullable: true })
  @Index()
  variantId: string;

  @ManyToOne(() => ProductVariantEntity, variant => variant.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariantEntity;

  @Column({ nullable: true })
  @Index()
  productId: number;

  @ManyToOne(() => ProductEntity, product => product.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ nullable: true })
  @Index()
  dailyProductId: number;

  @ManyToOne(() => DailyProductEntity, dailyProduct => dailyProduct.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'dailyProductId' })
  dailyProduct: DailyProductEntity;
}
