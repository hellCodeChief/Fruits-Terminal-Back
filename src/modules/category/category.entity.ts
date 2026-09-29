import { CategoryClosureEntity } from "src/modules/category/categoryClosure/categoryClosure.entity";
import { ProductEntity } from "src/modules/product/product.entity";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PropertyEntity } from "../property/property.entity";
import { FileEntity } from "../files/files.entity";

@Entity({ name: 'category' })
export class CategoryEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ default: false })
    isParent: boolean;

    @Column({ type: "text", nullable: true })
    desc: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ default: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    parentId?: number; // It would not be saved in database, but it can be in insert payload

    // RELATIONS
    @OneToMany(() => CategoryClosureEntity, categoryClosure => categoryClosure.parentCategory, {
        cascade: true,
        onDelete: "CASCADE"
    })
    parentCategories: CategoryClosureEntity[];

    @OneToMany(() => CategoryClosureEntity, categoryClosure => categoryClosure.childCategory, {
        cascade: true,
        onDelete: "CASCADE"
    })
    childCategories: CategoryClosureEntity[];

    @ManyToMany(() => ProductEntity, (product) => product.categories)
    products: ProductEntity[];

    @ManyToMany(() => PropertyEntity, (property) => property.categories)
    properties: PropertyEntity[];

    @OneToMany(() => FileEntity, file => file.category)
    files: FileEntity[];

};