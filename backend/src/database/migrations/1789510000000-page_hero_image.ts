import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ảnh nền dải tiêu đề đầu trang con (PageHero): mỗi trang tự chọn ảnh trong
 * Admin → Trang, kèm điểm lấy nét (CSS object-position, VD "50% 62%").
 * Trống = website dùng ảnh vườn hạnh nhân mặc định.
 */
export class PageHeroImage1789510000000 implements MigrationInterface {
  name = 'PageHeroImage1789510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`pages\`
       ADD \`hero_image_path\` varchar(500) NULL AFTER \`lead\`,
       ADD \`hero_image_position\` varchar(40) NULL AFTER \`hero_image_path\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`pages\` DROP COLUMN \`hero_image_position\`, DROP COLUMN \`hero_image_path\``,
    );
  }
}
