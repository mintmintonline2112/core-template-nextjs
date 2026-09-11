import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Khoảng đệm khi xoay refresh token.
 *
 * Xoay token mà không có khoảng đệm sẽ đá nhầm người dùng thật: mở hai tab admin,
 * cả hai cùng hết hạn access token một lúc rồi cùng gọi làm mới, tab chạy sau gửi
 * token vừa bị xoay và bị coi là đánh cắp. Hai cột này giữ lại chuỗi băm của token
 * ngay trước đó cùng thời điểm xoay, để một lần gọi trễ vài giây vẫn được chấp nhận.
 */
export class AddRefreshTokenGrace1789700000000 implements MigrationInterface {
  name = 'AddRefreshTokenGrace1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` ADD \`previous_token_hash\` varchar(64) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` ADD \`rotated_at\` datetime(6) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` DROP COLUMN \`rotated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` DROP COLUMN \`previous_token_hash\``,
    );
  }
}
