import {
    IsArray,
} from 'class-validator';

export class AssignRoleDTO {
    @IsArray()
    roleId: Array<string>;
};
