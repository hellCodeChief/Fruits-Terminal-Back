import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { FileEntity } from "../files/files.entity";

// ✅ حجره: ستون‌های product به‌اضافه قیمت، حداقل سفارش، توضیح و عکس
@Entity({ name: 'dailyProduct' })
export class DailyProductEntity {

    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    slug: string;

    @Column({ nullable: true })
    defaultVariantId: number;

    @Column({ type: 'bigint', default: 0 })
    price: number;

    // حداقل سفارش به کیلو
    @Column({ type: 'int', nullable: true })
    minOrder: number;

    @Column({ type: 'text', nullable: true })
    desc: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => FileEntity, file => file.dailyProduct)
    files: FileEntity[];
}
