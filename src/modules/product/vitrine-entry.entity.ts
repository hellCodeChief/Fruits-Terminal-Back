import { CategoryEntity } from 'src/modules/category/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity({ name: 'vitrineEntry' })
@Index(['productId', 'createdAt'])
export class VitrineEntryEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', default: 'کیلو' })
  unit: string;

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
