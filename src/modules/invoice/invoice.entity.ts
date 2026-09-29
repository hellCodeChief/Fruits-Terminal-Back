import { InvoiceDetail } from 'src/modules/invoice/invoiceDetails/invoiceDetails.entity';
import { PaymentEntity } from 'src/modules/payment/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceStatusEnum, PaymentMethodEnum } from './invoice.enum';
import { BasketEntity } from '../basket/basket.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'invoices' })
export class InvoiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 64, unique: true })
    invoiceNumber: string; // e.g. INV-1404-0001

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'enum', enum: InvoiceStatusEnum, default: InvoiceStatusEnum.PENDING })
    status: InvoiceStatusEnum;

    @Column({ type: 'bigint', default: 0 })
    shippingFee: string;

    @Column({ type: 'bigint', default: 0 })
    subtotalAmount: number;

    @Column({ type: 'bigint', default: 0 })
    totalDiscount: number;

    @Column({ type: 'bigint', default: 0 })
    totalTax: number;

    @Column({ type: 'bigint', default: 0 })
    finalAmount: number;

    @Column({ type: 'enum', enum: PaymentMethodEnum, default: null, nullable: true })
    paymentMethod: PaymentMethodEnum | null;

    @Column({ type: 'text', nullable: true })
    customerNote: string | null;

    @Column({ nullable: true })
    reservedAt: string | null;

    @Column({ nullable: true })
    paidAt: string | null;

    @Column({ type: 'uuid' })
    basketId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // RELATIONS
    @OneToMany(() => InvoiceDetail, d => d.invoice, { cascade: true, eager: true })
    details: InvoiceDetail[];

    @OneToMany(() => PaymentEntity, p => p.invoice, { eager: true })
    payments: PaymentEntity[];

    @ManyToOne(() => BasketEntity, b => b.invoices, { eager: true })
    @JoinColumn({ name: 'basketId' })
    basket: BasketEntity;

    @ManyToOne(() => UserEntity, u => u.invoices, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

}