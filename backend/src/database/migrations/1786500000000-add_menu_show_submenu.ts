import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMenuShowSubmenu1786500000000 implements MigrationInterface {
  name = 'AddMenuShowSubmenu1786500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `menu_items` ADD `show_submenu` tinyint NOT NULL DEFAULT 1",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `menu_items` DROP COLUMN `show_submenu`',
    );
  }
}
