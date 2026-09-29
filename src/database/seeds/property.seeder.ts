import { Logger } from "@nestjs/common";
import { staticProperties } from "src/database/seeds/data/static-properties";
import { PropertyEntity } from "src/modules/property/property.entity";
import { PropertyType } from "src/modules/property/types/propery.type";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-seeding";

export default class addDefaultProperties implements Seeder {
    public async run(_: any, dataSource: DataSource): Promise<void> {
        const propertyRepository = dataSource.getRepository(PropertyEntity);
        Logger.fatal('Start addDefaultProperties');

        if (staticProperties.length === 0) {
            Logger.fatal('No properties to add');
            return;
        }

        const existingProperties = await propertyRepository.find();

        // Checking for changes
        const propertiesToUpdate = staticProperties.filter(property =>
            existingProperties.some(existing => existing.Ename === property.Ename && existing.type !== property.type)
        );

        const propertiesToRemove = existingProperties.filter(existing =>
            !staticProperties.some(property => property.Ename === existing.Ename)
        );

        const propertiesToAdd = staticProperties.filter(property =>
            !existingProperties.some(existing => existing.Ename === property.Ename)
        );

        // Update
        if (propertiesToUpdate.length > 0) {
            for (const property of propertiesToUpdate) {
                const existingProperty = await propertyRepository.findOne({ where: { Ename: property.Ename } });
                if (existingProperty) {
                    existingProperty.type = property.type as PropertyType;
                    await propertyRepository.save(existingProperty);
                    Logger.fatal('Property updated:', existingProperty);
                };
            };
        };

        // Add
        if (propertiesToAdd.length > 0) {
            await propertyRepository.save(propertiesToAdd);
            Logger.fatal('Properties added:', propertiesToAdd.map(p => p.Ename));
        };

        // Skip if No changes detected
        if (propertiesToAdd.length === 0 && propertiesToRemove.length === 0 && propertiesToUpdate.length === 0) {
            Logger.fatal('No changes detected. Skipping operations.');
        };

        Logger.fatal('End addDefaultProperties');
    }
};