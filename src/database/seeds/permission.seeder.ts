import { Logger } from "@nestjs/common";
import { staticPermissions } from "src/database/seeds/data/static-permissions";
import { PermissionEntity } from "src/modules/permission/permission.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-seeding";

export default class addDefaultUser implements Seeder {
  public async run(_: any, dataSource: DataSource): Promise<void> {
    const permissionRepository = dataSource.getRepository(PermissionEntity);
    Logger.fatal('Start addDefaultPermissions');

    if (staticPermissions.length === 0) {
      Logger.fatal('No permissions to add');
      return;
    }

    // Fetch all existing permissions from the database
    const existingPermissions = await permissionRepository.find();

    // Find permissions that need to be updated (same name, different description)
    const permissionsToUpdate = staticPermissions.filter(staticPerm =>
      existingPermissions.some(
        existingPerm =>
          existingPerm.name === staticPerm.name &&
          existingPerm.description !== staticPerm.description,
      ),
    );

    // Find permissions that should be removed (not present in staticPermissions)
    const permissionsToRemove = existingPermissions.filter(
      existingPerm => !staticPermissions.some(staticPerm => staticPerm.name === existingPerm.name),
    );

    // Find new permissions that should be added
    const permissionsToAdd = staticPermissions.filter(
      staticPerm => !existingPermissions.some(existingPerm => existingPerm.name === staticPerm.name),
    );

    // Update existing permissions with new descriptions
    if (permissionsToUpdate.length > 0) {
      for (const perm of permissionsToUpdate) {
        const existingPerm = await permissionRepository.findOne({ where: { name: perm.name } });
        if (existingPerm) {
          existingPerm.description = perm.description;
          await permissionRepository.save(existingPerm);
          Logger.fatal(`Permission updated: ${perm.name}`);
        };
      };
    };

    // Remove permissions that are no longer needed
    if (permissionsToRemove.length > 0) {
      for (const perm of permissionsToRemove) {
        await permissionRepository.remove(perm);
        Logger.fatal(`Permission removed: ${perm.name}`);
      };
    };

    // Add new permissions to the database
    if (permissionsToAdd.length > 0) {
      await permissionRepository.save(permissionsToAdd);
      Logger.fatal(`Permissions added: ${permissionsToAdd.map(p => p.name).join(', ')}`);
    };

    // Skip if no changes are needed
    if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0 && permissionsToUpdate.length === 0) {
      Logger.fatal('No changes detected in permissions. Skipping operations.');
    };

    Logger.fatal('End addDefaultPermissions');
  }
};