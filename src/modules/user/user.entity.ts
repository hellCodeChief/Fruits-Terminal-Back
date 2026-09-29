import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { RoleEntity } from "src/modules/role/role.entity";
import HashClass from "src/common/utils/crypto.util";
import { InvoiceEntity } from "../invoice/invoice.entity";

@Entity({ name: 'user' })
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    @Index()
    email: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ nullable: true, select: false })
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true, default: null, select: false })
    token: string;

    @Column({ nullable: true, default: null, select: false })
    salt: string;

    @Column({ unique: true, nullable: false })
    @Index()
    phone: string;

    @Column({ default: false })
    isPhoneVerified: boolean;

    @Column({ default: 'customer' })
    accountType: 'customer' | 'admin';

    @Column({ nullable: true })
    lastLogin: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // RELATIONS
    @ManyToMany(() => RoleEntity, role => role.users, { eager: true })
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' }
    })
    roles: RoleEntity[];

    @OneToMany(() => InvoiceEntity, i => i.user)
    invoices: InvoiceEntity[];

    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    private async hashPassword(): Promise<void> {
        const salt = HashClass.generateRandomSalt();

        if (!!this.password?.trim()) {
            this.password = HashClass.makeHash(this.password, salt);
            this.salt = salt;
        };
    };
}
