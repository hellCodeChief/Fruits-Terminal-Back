import { Logger } from "@nestjs/common";
import { CategoryEntity } from "src/modules/category/category.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-seeding";

export default class addDefaultUser implements Seeder {
    public async run(_: any, dataSource: DataSource): Promise<void> {
        const categoryRepository = dataSource.getRepository(CategoryEntity);
        Logger.fatal('Start addDefaultCategories');

        const noCats = { isParent: true, desc: "این دسته بندی شامل محصولاتی است که فاقد هرگونه دسته بندی ای هستند", slug: "noCats", displayName: "بدون دسته بندی", isActive: true };
        const existedCategory = await categoryRepository.findOneBy({ slug: noCats.slug });

        if (!existedCategory) {
            const catObj = categoryRepository.create(noCats);
            await categoryRepository.save(catObj);
            Logger.fatal('Category added: noCats');
        } else {
            await categoryRepository.update(existedCategory.id, noCats);
            Logger.fatal('Category updated: noCats');
        };

        Logger.fatal('End addDefaultCategories');
    }
};