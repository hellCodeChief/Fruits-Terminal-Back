import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasketEntity } from 'src/modules/basket/basket.entity';
import { ProductVariantEntity } from 'src/modules/productVariant/productVariant.entity';


@Entity({ name: 'basketItems' })
export class BasketItemsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    basketId: string;

    @Column({ type: 'int' })
    productVariantId: number;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'bigint', default: 0 })
    rowTotal: number;

    @Column({ nullable: false, default: {}, type: 'json' })
    snapshot: Record<string, any>; // previouse variant object

    // RELATIONS
    @ManyToOne(() => ProductVariantEntity, { eager: false })
    @JoinColumn({ name: 'productVariantId' })
    productVariant: ProductVariantEntity;

    @ManyToOne(() => BasketEntity, basket => basket.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'basketId' })
    basket: BasketEntity;
}