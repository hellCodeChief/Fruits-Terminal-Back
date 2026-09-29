
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { BasketEntity } from './basket.entity';
import { BasketInsertDTO } from './dtos/createBasket.dto';
import { BasketStatusEnum } from './basket.enum';
import { BasketItemsEntity } from 'src/modules/basket/basketItems/basketItems.entity';
import { ProductVariantEntity } from 'src/modules/productVariant/productVariant.entity';
import { BasketListFilterDTO } from './dtos/basketListFilter.dto';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { InvoiceDetail } from '../invoice/invoiceDetails/invoiceDetails.entity';
import { InvoiceStatusEnum } from '../invoice/invoice.enum';
import * as moment from 'moment-jalaali';


@Injectable()
export class BasketService {
    constructor(
        @InjectRepository(BasketEntity)
        private readonly basketRepository: Repository<BasketEntity>,
        private readonly dataSource: DataSource,
    ) { }

    async findAll(filters: BasketListFilterDTO) {
        try {
            return await this.basketRepository.find({
                where: filters,
                relations: ['user', 'items', 'items.productVariant', 'items.productVariant.files'],
            });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string) {
        try {
            return await this.basketRepository.find({
                where: { id },
                relations: ['items', 'items.productVariant', 'items.productVariant.files'],
            });
        } catch (error) {
            throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async syncBasket({ items }: BasketInsertDTO, userId: string) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            // helpers
            const calculateTotals = (basket: BasketEntity) => {
                const totals = basket.items.reduce(
                    (acc, item) => {
                        const qty = Number(item.quantity || 0);
                        const price = Number(item.snapshot?.price || 0);
                        const disc = Number(item.snapshot?.calculatedDiscount || 0);
                        const tax = Number(item.snapshot?.calculatedTax || 0);

                        acc.subtotal += (price * qty);
                        acc.discount += (disc * qty);
                        acc.tax += (tax * qty);
                        acc.eachRow += Number(item.rowTotal || 0);
                        return acc;
                    },
                    { subtotal: 0, discount: 0, tax: 0, eachRow: 0 },
                );

                basket.subtotalAmount = totals.subtotal;
                basket.totalDiscount = totals.discount;
                basket.totalTax = totals.tax;
                basket.finalAmount = totals.eachRow;
            };

            // load or create basket
            let basket = await qr.manager.findOne(BasketEntity, {
                where: { userId, status: BasketStatusEnum.OPEN },
                order: { createdAt: 'DESC' },
                relations: ['items', 'items.productVariant', 'items.productVariant.files']
            });

            if (!basket) {
                basket = qr.manager.create(BasketEntity, { userId, status: BasketStatusEnum.OPEN, items: [] });
                basket = await qr.manager.save(basket);
            }

            // case: empty incoming array → clear basket
            if (items.length === 0) {
                if (basket.items?.length) {
                    const ids = basket.items.map(i => i.id);
                    await qr.manager.delete(BasketItemsEntity, ids);
                }

                basket.items = [];
                calculateTotals(basket);
                await qr.manager.save(basket);

                await qr.commitTransaction();
                return await this.basketRepository.findOne({ where: { id: basket.id }, relations: ['items', 'items.productVariant', 'items.productVariant.files'] });
            }

            // prepare lookup structures
            const existingMap = new Map(basket.items.map(i => [i.productVariantId, i]));
            const incomingMap = new Map(items.map(i => [i.productVariantId, i]));

            // remove items no longer present
            const removedOps = [...existingMap.entries()]
                .filter(([pvId]) => !incomingMap.has(pvId))
                .map(([_, exists]) => qr.manager.delete(BasketItemsEntity, exists.id));

            if (removedOps.length) await Promise.all(removedOps);

            // add/update items
            await Promise.all(items.map(async ({ productVariantId, quantity }) => {
                const variant = await qr.manager.findOne(ProductVariantEntity, { where: { id: productVariantId } });
                if (!variant)
                    throw new HttpException(`Product variant ${productVariantId} not found`, HttpStatus.BAD_REQUEST);

                const snapshot = {
                    id: variant.id,
                    name: variant.name,
                    slug: variant.slug,
                    sku: variant.sku,
                    price: variant.price,
                    discountPercentage: variant.discountPercentage,
                    taxPercentage: variant.taxPercentage,
                    calculatedDiscount: variant.calculatedDiscount,
                    calculatedTax: variant.calculatedTax,
                    stock: variant.stock,
                    productId: variant.productId,
                    desc: variant.desc,
                    isActive: variant.isActive,
                    updatedAt: variant.updatedAt,
                    createdAt: variant.createdAt
                };

                const exists = existingMap.get(productVariantId);

                const rowTotal = ((Number(variant.price) - Number(variant.calculatedDiscount)) + Number(variant.calculatedTax)) * quantity;
                if (!exists) {
                    const newItem = qr.manager.create(BasketItemsEntity, {
                        basketId: basket.id,
                        productVariantId,
                        quantity,
                        snapshot,
                        rowTotal,
                    });
                    return qr.manager.save(newItem);
                }

                exists.quantity = quantity;
                exists.snapshot = snapshot;
                exists.rowTotal = rowTotal;
                return qr.manager.save(exists);
            }));

            // Sync items
            basket.items = await qr.manager.find(BasketItemsEntity, { where: { basketId: basket.id } });

            // calculate totals manually
            calculateTotals(basket);
            await qr.manager.save(basket);

            await qr.commitTransaction();

            return await this.basketRepository.findOne({
                where: { id: basket.id },
                relations: ['items', 'items.productVariant', 'items.productVariant.files']
            });

        } catch (error) {
            await qr.rollbackTransaction();
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                { message: 'Failed to sync basket', detail: error?.message || error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        } finally {
            await qr.release();
        }
    }

    async checkout(basketId: string, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Load the basket along with its items for the given user
            const basket = await queryRunner.manager.findOne(BasketEntity, {
                where: { id: basketId, userId },
                relations: ['items'],
            });
            if (!basket)
                throw new HttpException('Basket not found', HttpStatus.NOT_FOUND);

            // Check if there is an existing pending invoice for this basket
            let invoice = await queryRunner.manager.findOne(InvoiceEntity, {
                where: { basketId, status: InvoiceStatusEnum.PENDING },
                relations: ['details'],
            });

            // Prepare invoice details from basket items
            const detailsData = basket.items.map(item => {
                const qty = Number(item.quantity || 0);

                return {
                    productVariantId: item.productVariantId,
                    quantity: qty,
                    rowTotal: item.rowTotal,
                    variantSnapshot: JSON.stringify(item.snapshot), // store product snapshot
                };
            });

            // Create a new invoice if none exists
            if (!invoice) {
                const invoiceNumber = await this.generateInvoiceNumber(queryRunner);

                // Create invoice entity without details
                const newInvoice = queryRunner.manager.create(InvoiceEntity, {
                    invoiceNumber,
                    basketId,
                    userId: basket.userId,
                    subtotalAmount: basket.subtotalAmount,
                    totalDiscount: basket.totalDiscount,
                    totalTax: basket.totalTax,
                    finalAmount: basket.finalAmount,
                });

                // Save invoice to generate an ID
                const savedInvoice = await queryRunner.manager.save(InvoiceEntity, newInvoice);

                if (!savedInvoice.id) {
                    throw new Error('Failed to generate invoice ID');
                }

                // Insert invoice details with the guaranteed invoiceId
                if (detailsData.length > 0) {
                    const rows = detailsData.map(d => ({
                        invoiceId: savedInvoice.id, // associate details with invoice
                        ...d,
                    }));

                    await queryRunner.manager
                        .createQueryBuilder()
                        .insert()
                        .into(InvoiceDetail)
                        .values(rows)
                        .execute();
                }

                // Reload the full invoice with details
                invoice = await queryRunner.manager.findOne(InvoiceEntity, {
                    where: { id: savedInvoice.id },
                    relations: ['details', 'details.productVariant', 'details.productVariant.files'],
                });
            }

            // Update existing pending invoice
            else {
                // Update invoice totals based on basket
                invoice.subtotalAmount = basket.subtotalAmount;
                invoice.totalDiscount = basket.totalDiscount;
                invoice.totalTax = basket.totalTax;
                invoice.finalAmount = basket.finalAmount;

                // Remove previous invoice details
                await queryRunner.manager.delete(InvoiceDetail, { invoiceId: invoice.id });

                // Insert new invoice details with the current invoiceId
                if (detailsData.length > 0) {
                    const rows = detailsData.map(d => ({
                        invoiceId: invoice.id,
                        ...d,
                    }));

                    await queryRunner.manager
                        .createQueryBuilder()
                        .insert()
                        .into(InvoiceDetail)
                        .values(rows)
                        .execute();
                }

                // Avoid TypeORM trying to sync details relation
                delete (invoice as any).details;

                // Save updated invoice totals
                await queryRunner.manager.save(invoice);

                // Reload invoice with details for returning
                invoice = await queryRunner.manager.findOne(InvoiceEntity, {
                    where: { id: invoice.id },
                    relations: ['details', 'details.productVariant', 'details.productVariant.files'],
                });
            }

            await queryRunner.commitTransaction();
            return invoice;

        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw new HttpException(
                { message: 'Checkout failed', detail: error?.message || error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        } finally {
            await queryRunner.release();
        }
    }

    // PRIVATE METHODS
    private async generateInvoiceNumber(qr: QueryRunner) {
        const jalaliYear = moment().format('jYYYY');

        const nextVal = await qr.query(`SELECT nextval('invoice_seq')`);
        const seq = nextVal[0].nextval.toString().padStart(4, '0');

        return `INV-${jalaliYear}-${seq}`;
    }

}
