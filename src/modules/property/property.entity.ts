
import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn
} from "typeorm";
import { PropertyType } from "./types/propery.type";
import { PropertyValueEntity } from "src/modules/propertyValue/propertyValue.entity";
import { CategoryEntity } from "src/modules/category/category.entity";
import { PropertyProductVariantEntity } from "src/modules/propertyProductVariant/propertyProductVariant.entity";
import { ProductEntity } from "src/modules/product/product.entity";

@Entity({ name: 'property' })
export class PropertyEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column()
    @Index()
    Ename: string;

    @Column()
    @Index()
    Fname: string;

    @Column({ type: "text", nullable: true })
    example: string;

    @Column({ type: "enum", enum: PropertyType, default: PropertyType.TEXT })
    type: PropertyType;

    @CreateDateColumn()
    createdAt: Date;

    // RELATIONS
    @OneToMany(() => PropertyValueEntity, (propertyValue) => propertyValue.property, {
        cascade: true,
        onDelete: "CASCADE"
    })
    propertyValues: PropertyValueEntity[];

    @ManyToMany(() => CategoryEntity, (category) => category.properties, {
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "propertyCategory",
        joinColumn: {
            name: "propertyId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "categoryId",
            referencedColumnName: "id"
        }
    })
    categories: CategoryEntity[];

    @ManyToMany(() => ProductEntity, (product) => product.properties)
    products: ProductEntity[];

    @OneToMany(() => PropertyProductVariantEntity, (propertyProductVariant) => propertyProductVariant.property)
    propertyProductVariants: PropertyProductVariantEntity[];
}