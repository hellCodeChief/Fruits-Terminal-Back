import { CategoryEntity } from "src/modules/category/category.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: 'categoryClosure' })
export class CategoryClosureEntity {

    // FIELDS
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column()
    parentId: number;

    @Column()
    childId: number;

    @Column()
    depth: number;

    // RELATIONS
    @ManyToOne(() => CategoryEntity, category => category.parentCategories, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: 'parentId' })
    parentCategory: CategoryEntity;

    @ManyToOne(() => CategoryEntity, category => category.childCategories, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: 'childId' })
    childCategory: CategoryEntity;
};