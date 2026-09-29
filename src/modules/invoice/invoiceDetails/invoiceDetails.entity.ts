import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceEntity } from '../invoice.entity';
import { ProductVariantEntity } from '../../productVariant/productVariant.entity';


@Entity({ name: 'invoiceDetails' })
export class InvoiceDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    invoiceId: string;

    @Column({ type: 'int' })
    productVariantId: number;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'bigint', default: 0 })
    rowTotal: number;

    @Column({ type: 'text', nullable: true })
    variantSnapshot: string | null;

    // RELATIONS
    @ManyToOne(() => InvoiceEntity, invoice => invoice.details, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoiceId' })
    invoice: InvoiceEntity;

    @ManyToOne(() => ProductVariantEntity, { eager: false })
    @JoinColumn({ name: 'productVariantId' })
    productVariant: ProductVariantEntity;

}