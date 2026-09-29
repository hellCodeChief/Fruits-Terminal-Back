import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PaymentProviderEnum, PaymentStatusEnum } from './payment.enum';
import { InvoiceEntity } from '../invoice/invoice.entity';


@Entity({ name: 'payments' })
export class PaymentEntity {
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ type: 'uuid' })
    invoiceId: string;

    @Column({ length: 32 })
    provider: PaymentProviderEnum;

    @Column({ length: 255, nullable: true })
    authority: string | null;

    @Column({ length: 255, nullable: true })
    refId: string | null;

    @Column({ type: 'enum', enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
    status: PaymentStatusEnum;

    @Column({ type: 'bigint', default: 0 })
    amount: number;

    @CreateDateColumn()
    requestedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date | null;

    @Column({ type: 'text', nullable: true })
    responseData: string | null;

    @Column({ type: 'text', nullable: true })
    maskedCardNumber: string | null;

    @Column({ type: 'text', nullable: true })
    ipAddress: string | null;

    @Column({ type: 'text', nullable: true })
    userAgent: string | null;

    // RELATIONS    
    @ManyToOne(() => InvoiceEntity, invoice => invoice.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoiceId' })
    invoice: InvoiceEntity;

}