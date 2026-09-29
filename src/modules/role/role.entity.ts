import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "src/modules/user/user.entity";
import { PermissionEntity } from "src/modules/permission/permission.entity";

@Entity({ name: 'role' })
export class RoleEntity {

    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    color: string;

    @ManyToMany(() => UserEntity, user => user.roles)
    users: UserEntity[];

    @ManyToMany(() => PermissionEntity, permission => permission.roles, { eager: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
    })
    permissions: PermissionEntity[];
}
