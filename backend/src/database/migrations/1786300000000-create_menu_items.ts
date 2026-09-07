import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuItems1786300000000 implements MigrationInterface {
  name = 'CreateMenuItems1786300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`menu_items\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`label\` varchar(160) NOT NULL,
        \`href\` varchar(500) NOT NULL,
        \`parent_id\` int UNSIGNED NULL,
        \`description\` varchar(255) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        INDEX \`IDX_menu_items_parent\` (\`parent_id\`),
        INDEX \`IDX_base_deleted\` (\`deleted_at\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`menu_items\`
      ADD CONSTRAINT \`FK_menu_items_parent\`
      FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_menu_items_parent\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_items\``);
  }
}
