import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791355800000 implements MigrationInterface {
    name = 'Migration1791355800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // حداقل سفارش روی تنوع موجود، به کیلو
        await queryRunner.query(`
            ALTER TABLE "productVariant"
            ADD COLUMN IF NOT EXISTS "minOrder" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "productVariant"
            DROP COLUMN IF EXISTS "minOrder"
        `);
    }
}
