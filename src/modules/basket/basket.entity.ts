import { BasketItemsEntity } from 'src/modules/basket/basketItems/basketItems.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate, OneToOne } from 'typeorm';
import { BasketStatusEnum } from './basket.enum';
import { UserEntity } from 'src/modules/user/user.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';

@Entity({ name: 'basket' })
export class BasketEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    userId: string | null;

    @Column({ type: 'enum', enum: BasketStatusEnum, default: BasketStatusEnum.OPEN })
    status: BasketStatusEnum;

    @Column({ type: 'bigint', default: 0 })
    subtotalAmount: number;

    @Column({ type: 'bigint', default: 0 })
    totalDiscount: number;

    @Column({ type: 'bigint', default: 0 })
    totalTax: number;

    @Column({ type: 'bigint', default: 0 })
    finalAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // RELATIONS
    @OneToMany(() => BasketItemsEntity, item => item.basket, { cascade: true, eager: true })
    items: BasketItemsEntity[];

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => InvoiceEntity, i => i.basket)
    invoices: InvoiceEntity[];

}
