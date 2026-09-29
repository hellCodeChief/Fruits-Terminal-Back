import { CategoryEntity } from "src/modules/category/category.entity";
import { ProductVariantEntity } from "src/modules/productVariant/productVariant.entity";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PropertyEntity } from "../property/property.entity";
import { FileEntity } from "../files/files.entity";

@Entity({ name: 'product' })
export class ProductEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    slug: string;

    @Column({ nullable: true })
    defaultVariantId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // RELATIONS
    @OneToMany(() => ProductVariantEntity, productVariant => productVariant.product, {
        cascade: true, // Handled by TypeORM for Insert/Update
        onDelete: "CASCADE" // Handled by Database for Deletion
    })
    variants: ProductVariantEntity[];

    @ManyToMany(() => CategoryEntity, (category) => category.products, {
        onDelete: "CASCADE",
    })
    @JoinTable({
        name: 'productCategory',
        joinColumn: {
            name: 'productId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'categoryId',
            referencedColumnName: 'id',
        },
    })
    categories: CategoryEntity[];

    @ManyToMany(() => PropertyEntity, (property) => property.products, {
        onDelete: "CASCADE",
    })
    @JoinTable({
        name: 'productProperty',
        joinColumn: {
            name: 'productId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'propertyId',
            referencedColumnName: 'id',
        },
    })
    properties: PropertyEntity[];

    @OneToMany(() => FileEntity, file => file.product)
    files: FileEntity[];
};