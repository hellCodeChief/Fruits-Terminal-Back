import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791500000000 implements MigrationInterface {
    name = 'Migration1791500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // جدول حجره؛ ردیف‌های product دست نمی‌خورند
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "dailyProduct" (
                "id" SERIAL NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "slug" character varying NOT NULL,
                "defaultVariantId" integer,
                "price" bigint NOT NULL DEFAULT 0,
                "minOrder" integer,
                "desc" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_dailyProduct" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "files"
            ADD COLUMN IF NOT EXISTS "dailyProductId" integer
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_files_dailyProductId"
            ON "files" ("dailyProductId")
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_files_dailyProductId'
                ) THEN
                    ALTER TABLE "files"
                    ADD CONSTRAINT "FK_files_dailyProductId"
                    FOREIGN KEY ("dailyProductId") REFERENCES "dailyProduct"("id")
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "files" DROP CONSTRAINT IF EXISTS "FK_files_dailyProductId"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_files_dailyProductId"
        `);
        await queryRunner.query(`
            ALTER TABLE "files" DROP COLUMN IF EXISTS "dailyProductId"
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS "dailyProduct"
        `);
    }
}
