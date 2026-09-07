import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSectionDefinitions1789100000000 implements MigrationInterface {
  name = 'CreateSectionDefinitions1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`section_definitions\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`page_slug\` varchar(120) NOT NULL,
        \`section_key\` varchar(120) NOT NULL,
        \`label\` varchar(160) NOT NULL,
        \`description\` text NULL,
        \`fields\` json NOT NULL,
        INDEX \`IDX_base_deleted\` (\`deleted_at\`),
        UNIQUE INDEX \`UQ_section_definitions_key\` (\`section_key\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`section_definitions\``);
  }
}
