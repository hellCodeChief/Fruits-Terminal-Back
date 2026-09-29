
import { ProductVariantEntity } from "src/modules/productVariant/productVariant.entity";
import { PropertyValueEntity } from "src/modules/propertyValue/propertyValue.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { PropertyEntity } from "../property/property.entity";

@Entity({ name: 'propertyProductVariant' })
export class PropertyProductVariantEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column()
    @Index()
    productVariantId: number;

    @Column()
    @Index()
    propertyId: number;

    @Column()
    @Index()
    propertyValueId: number;

    // RELATIONS
    @ManyToOne(() => ProductVariantEntity, (productVariant) => productVariant.propertyProductVariants, {
        // When a ProductVariant is deleted, all related PropertyProductVariants will be automatically deleted as well
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'productVariantId' })
    productVariant: ProductVariantEntity;

    @ManyToOne(() => PropertyEntity, (property) => property.propertyProductVariants, {
        // When a Property is deleted, all associated PropertyProductVariants will be removed
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'propertyId' })
    property: PropertyEntity;

    @ManyToOne(() => PropertyValueEntity, (propertyValue) => propertyValue.propertyProductVariants, {
        // When a PropertyValue is deleted, all related PropertyProductVariants will also be deleted
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'propertyValueId' })
    propertyValue: PropertyValueEntity;

};