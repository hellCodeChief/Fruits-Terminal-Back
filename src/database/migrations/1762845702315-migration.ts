import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762845702315 implements MigrationInterface {
    name = 'Migration1762845702315';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create sequence if it does not exist
        await queryRunner.query(`
            CREATE SEQUENCE IF NOT EXISTS invoice_seq
            START 1
            INCREMENT 1
            MINVALUE 1
            NO MAXVALUE
            CACHE 1;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the sequence if rolling back
        await queryRunner.query(`
            DROP SEQUENCE IF EXISTS invoice_seq;
        `);
    }
}
