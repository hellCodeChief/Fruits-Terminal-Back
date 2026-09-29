import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { RoleEntity } from "src/modules/role/role.entity";

@Entity({ name: 'permission' })
export class PermissionEntity {

    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity[];
};
