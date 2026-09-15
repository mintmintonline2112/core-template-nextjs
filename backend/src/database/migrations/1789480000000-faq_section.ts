import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Trang chủ trình bày khối "Why Prime Nuts USA?" dạng accordion FAQ
 * (section `faq`, component Faq.tsx) thay cho lưới thẻ (section `why-us`, WhyUs.tsx).
 *
 * - `why-us` chỉ bị TẮT (không xoá) — giữ nội dung để bật lại khi cần.
 * - `faq` do `db:seed` tạo (deploy.sh chạy seed ngay sau migration).
 */
export class FaqSection1789480000000 implements MigrationInterface {
  name = 'FaqSection1789480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 0
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'why-us'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`is_active\` = 1
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` = 'why-us'`,
    );
  }
}
