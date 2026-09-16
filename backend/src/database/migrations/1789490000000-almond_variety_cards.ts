import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Trang chủ trình bày giống hạnh nhân dạng thẻ lớn + công tắc "Short version"
 * (section `almond-variety-cards`, component AlmondVarietyCards.tsx) thay cho
 * ảnh tròn đánh số (section `almond-varieties`, AlmondVarieties.tsx).
 *
 * - `almond-varieties` chỉ bị TẮT (không xoá) — giữ nội dung để bật lại khi cần.
 * - `almond-variety-cards` do `db:seed` tạo (deploy.sh chạy seed ngay sau migration).
 */
export class AlmondVarietyCards1789490000000 implements MigrationInterface {
  name = 'AlmondVarietyCards1789490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 0
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'almond-varieties'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 1
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'almond-varieties'`,
    );
  }
}
