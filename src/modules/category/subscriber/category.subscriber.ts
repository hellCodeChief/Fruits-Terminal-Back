import { EventSubscriber, EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm';
import { CategoryClosureEntity } from 'src/modules/category/categoryClosure/categoryClosure.entity';
import { CategoryEntity } from '../category.entity';

@EventSubscriber() // Must use Subscriber to get access to another entity inside a hook
export class CategorySubscriber implements EntitySubscriberInterface<CategoryEntity> {
    listenTo() {
        return CategoryEntity;
    };

    async afterInsert(event: InsertEvent<CategoryEntity>) {
        // استفاده از event.manager به منظور استفاده از همان تراکنش
        const categoryClosureRepository = event.manager.getRepository(CategoryClosureEntity);

        await this.createDefaultClosure(categoryClosureRepository, event.entity);
        await this.createHierarchyClosures(categoryClosureRepository, event.entity);
    };

    private async createDefaultClosure(categoryClosureRepository: Repository<CategoryClosureEntity>, category: CategoryEntity) {
        const payload = { parentId: category.id, childId: category.id, depth: 0 };
        const categoryClosure = categoryClosureRepository.create(payload);
        await categoryClosureRepository.save(categoryClosure);
    };

    private async createHierarchyClosures(categoryClosureRepository: Repository<CategoryClosureEntity>, category: CategoryEntity) {
        if (category.parentId && !category.isParent) {
            const parentsCategoryClosure = await categoryClosureRepository.find({ where: { childId: category.parentId }, order: { depth: "ASC" } });

            for (const eachPCC of parentsCategoryClosure) {
                const depth = eachPCC.depth + 1;
                const payload = { parentId: eachPCC.parentId, childId: category.id, depth };

                const categoryClosure = categoryClosureRepository.create(payload);
                await categoryClosureRepository.save(categoryClosure);
            };
        };
    };
};
