import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Song ngữ Việt–Trung: cột JSON `translations` trên các bảng nội dung.
 * Dạng { "zh": { "title": "...", "content": "..." } } — bản Việt là gốc,
 * field nào thiếu bản dịch thì public API fallback tiếng Việt.
 */
export class AddTranslationsColumns1786600000000 implements MigrationInterface {
  name = 'AddTranslationsColumns1786600000000';

  private static readonly TABLES = [
    'pages',
    'page_sections',
    'blog_posts',
    'blog_categories',
    'menu_items',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of AddTranslationsColumns1786600000000.TABLES) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` ADD \`translations\` json NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of AddTranslationsColumns1786600000000.TABLES) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` DROP COLUMN \`translations\``,
      );
    }
  }
}
