import { EventSubscriber, EntitySubscriberInterface, InsertEvent, Repository, In } from 'typeorm';
import { ProductEntity } from '../product.entity';
import { CategoryEntity } from 'src/modules/category/category.entity';

// This class listens to events on the ProductEntity (e.g. insert, update, remove)
// Useful for handling additional logic after certain actions
@EventSubscriber() // Required to access other repositories/entities within lifecycle hooks
export class ProductSubscriber implements EntitySubscriberInterface<ProductEntity> {

    // Tells TypeORM that this subscriber is only for ProductEntity
    listenTo() {
        return ProductEntity;
    };

    // Hook that runs after a new ProductEntity is inserted into the database
    async afterInsert(event: InsertEvent<ProductEntity>) {
        // Use the same transaction context via event.manager
        const categoryRepository = event.manager.getRepository(CategoryEntity);
        const productRepository = event.manager.getRepository(ProductEntity);

        // Add properties from categories to the newly inserted product
        await this.addCatsPropsToProduct(productRepository, categoryRepository, event.entity);
    };

    // Adds unique properties from all related categories to the product
    private async addCatsPropsToProduct(
        productRepository: Repository<ProductEntity>,
        categoryRepository: Repository<CategoryEntity>,
        product: ProductEntity
    ) {
        const catIds = (product.categories ?? [])
            .map(cat => cat?.id)
            .filter((id): id is number => typeof id === 'number');
        if (catIds.length === 0) return;

        // Fetch all properties from these categories
        const props = await this.getProps(categoryRepository, catIds);
        product.properties = props;

        // Save the updated product with properties included
        await productRepository.save(product);
    };

    // Fetches unique properties from given category IDs
    private async getProps(
        categoryRepository: Repository<CategoryEntity>,
        catIds: Array<number>
    ) {
        // Load categories with their related properties
        const categories = await categoryRepository.find({
            where: { id: In(catIds) },
            relations: ["properties"]
        });

        // Filter out duplicate properties using a Set
        const propIds = new Set<number>();
        const uniqueProperties = [];

        for (const cat of categories) {
            for (const prop of cat.properties) {
                if (!propIds.has(prop.id)) {
                    propIds.add(prop.id);
                    uniqueProperties.push(prop);
                };
            };
        };

        return uniqueProperties;
    };

};
