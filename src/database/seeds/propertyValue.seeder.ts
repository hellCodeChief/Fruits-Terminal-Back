import { Logger } from "@nestjs/common";
import { PropertyEntity } from "src/modules/property/property.entity";
import { PropertyValueEntity } from "src/modules/propertyValue/propertyValue.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-seeding";
import { staticPropertyValues } from "./data/static-propertyValue";

export default class addDefaultUser implements Seeder {
    public async run(_: any, dataSource: DataSource): Promise<void> {
        const propertyValueRepository = dataSource.getRepository(PropertyValueEntity);
        const propertyRepository = dataSource.getRepository(PropertyEntity);
        Logger.fatal('Start addPropertiesValue');

        if (staticPropertyValues.length === 0) {
            Logger.fatal('No propertiesValue to add');
            return;
        }

        const dbProperties = await propertyRepository.find();

        for (const staticPropValue of staticPropertyValues) {
            // Checking for changes
            const property = dbProperties.find(
                (prop) => prop.Ename === staticPropValue.propertyName,
            );

            if (property) {
                const existingValue = await propertyValueRepository.findOne({
                    where: {
                        propertyId: property.id,
                        Evalue: staticPropValue.Evalue,
                    },
                });

                // Create new Object
                if (!existingValue) {
                    const newPropertyValue = propertyValueRepository.create({
                        Evalue: staticPropValue.Evalue,
                        Fvalue: staticPropValue.Fvalue,
                        propertyId: property.id,
                    });

                    await propertyValueRepository.save(newPropertyValue);
                    Logger.fatal(`Value added: ${newPropertyValue.Evalue}`);
                };
            } else
                Logger.fatal(`Property not found: ${staticPropValue.propertyName}. Skipping operations.`);
        };
        Logger.fatal('End addPropertiesValue');
    };
};