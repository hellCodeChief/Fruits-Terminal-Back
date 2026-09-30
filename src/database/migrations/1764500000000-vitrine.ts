import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764500000000 implements MigrationInterface {
  name = 'Migration1764500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "normalizedName" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_normalizedName" ON "product" ("normalizedName")`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vitrineEntry" (
        "id" SERIAL NOT NULL,
        "price" integer NOT NULL,
        "unit" character varying NOT NULL DEFAULT 'جعبه',
        "description" character varying(300),
        "productId" integer NOT NULL,
        "categoryId" integer,
        "fileId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vitrineEntry" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vitrineEntry_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vitrineEntry_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_vitrineEntry_product_created" ON "vitrineEntry" ("productId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "vitrineEntry"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_normalizedName"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "normalizedName"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "name"`);
  }
}
