import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Danh mục blog: cột `display_name` (tùy chọn) — tên hiện ngoài website khi
 * tên trong dashboard cần rõ hơn (VD "Ca Veneer" → public chỉ hiện "Veneer").
 * NULL/trống → public dùng `name` như cũ.
 */
export class AddBlogCategoryDisplayName1786700000000
  implements MigrationInterface
{
  name = 'AddBlogCategoryDisplayName1786700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `blog_categories` ADD `display_name` varchar(255) NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `blog_categories` DROP COLUMN `display_name`',
    );
  }
}
