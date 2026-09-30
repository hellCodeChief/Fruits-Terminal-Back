import { CategoryEntity } from 'src/modules/category/category.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const VITRINE_UNITS = ['جعبه', 'کیسه', 'کیلو'] as const;
export type VitrineUnit = (typeof VITRINE_UNITS)[number];

@Entity({ name: 'vitrineEntry' })
@Index(['productId', 'createdAt'])
export class VitrineEntryEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', default: 'جعبه' })
  unit: VitrineUnit;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string | null;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: 'int', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity | null;

  @Column({ type: 'uuid', nullable: true })
  fileId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
