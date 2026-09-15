import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Trang chủ đổi hero tĩnh (section `hero-stats`, component HeroStats.tsx) sang
 * hero dạng slider (section `hero-slider`, component HeroSlider.tsx).
 *
 * - `hero-stats` chỉ bị TẮT (không xoá) — giữ nội dung để bật lại khi cần.
 * - `hero-slider` do `db:seed` tạo (deploy.sh chạy seed ngay sau migration).
 */
export class HeroSlider1789470000000 implements MigrationInterface {
  name = 'HeroSlider1789470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 0
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'hero-stats'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 1
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'hero-stats'`,
    );
  }
}
