import { HttpException, HttpStatus } from "@nestjs/common";
import { FileEntity } from "src/modules/files/files.entity";
import { ProductEntity } from "src/modules/product/product.entity";
import { PropertyProductVariantEntity } from "src/modules/propertyProductVariant/propertyProductVariant.entity";
import {
    BeforeInsert,
    BeforeUpdate,
    Check,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: 'productVariant' })
export class ProductVariantEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ nullable: true })
    @Index()
    name: string;

    @Column({ unique: true })
    @Index()
    slug: string; // Only accept english words and numbers

    @Column({ default: 0 })
    stock: number;

    @Column({ unique: true })
    sku: string;

    @Column({ type: "text", nullable: true })
    desc: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'bigint', default: 0 })
    price: number; // base price before discounts and tax

    @Column({ default: 0 })
    @Check(`"discountPercentage" >= 0 AND "discountPercentage" <= 100`)
    discountPercentage: number;

    @Column({ type: 'bigint', default: 0 })
    calculatedDiscount: number;

    @Column({ default: 0 })
    @Check(`"taxPercentage" >= 0 AND "taxPercentage" <= 100`)
    taxPercentage: number;

    @Column({ type: 'bigint', default: 0 })
    calculatedTax: number;

    @Column()
    @Index()
    productId: number;

    @Column({ nullable: true })
    barcode: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // RELATIONS
    @ManyToOne(() => ProductEntity, product => product.variants, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @OneToMany(() => PropertyProductVariantEntity, (propertyProductVariant) => propertyProductVariant.productVariant)
    propertyProductVariants: PropertyProductVariantEntity[];

    @OneToMany(() => FileEntity, file => file.variant)
    files: FileEntity[];

    // HOOKS
    @BeforeUpdate()
    @BeforeInsert()
    calculateDiscountAndTax() {
        const basePrice = Number(this.price) || 0;
        const discountPerc = Number(this.discountPercentage) || 0;
        const taxPerc = Number(this.taxPercentage) || 0;

        // Calculate discount
        const discountValue = (basePrice * discountPerc) / 100;
        this.calculatedDiscount = Number.isNaN(discountValue) ? 0 : discountValue;

        // Price after discount
        const discountedPrice = basePrice - this.calculatedDiscount;

        // Calculate tax on discounted price
        const taxValue = (discountedPrice * taxPerc) / 100;
        this.calculatedTax = Number.isNaN(taxValue) ? 0 : taxValue;
    }

    @BeforeInsert()
    @BeforeUpdate()
    validateSlug() {
        if (!/^(?! )[A-Za-z0-9\s-]*(?<! )$/.test(this.slug)) {
            throw new HttpException('Slug can only contain English letters, numbers, and hyphens', HttpStatus.BAD_REQUEST);
        }
    }
}
