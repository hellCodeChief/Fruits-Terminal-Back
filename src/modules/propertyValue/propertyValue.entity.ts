import { PropertyProductVariantEntity } from "src/modules/propertyProductVariant/propertyProductVariant.entity";
import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { PropertyEntity } from "../property/property.entity";

@Entity({ name: 'propertyValue' })
export class PropertyValueEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column()
    @Index()
    Evalue: string;

    @Column()
    @Index()
    Fvalue: string;

    @Column()
    @Index()
    propertyId: number;

    // RELATIONS
    @ManyToOne(() => PropertyEntity, (property) => property.propertyValues, {
        onDelete: "CASCADE"
    })
    property: PropertyEntity;

    @OneToMany(() => PropertyProductVariantEntity, (propertyProductVariant) => propertyProductVariant.propertyValue)
    propertyProductVariants: PropertyProductVariantEntity[];
};