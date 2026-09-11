import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Module `users` (tài khoản khách của dự án thương mại điện tử cũ) đã bị xoá
 * khỏi mã nguồn. Các quyền USER_* còn sót lại trong bảng permissions chỉ làm
 * rác danh sách phân quyền trong admin — gỡ luôn cả liên kết với role.
 *
 * Bảng `users` và `user_refresh_tokens` CỐ Ý giữ nguyên: xoá bảng là thao tác
 * không hoàn tác được, mà để lại thì vô hại. Muốn dọn hẳn thì tự chạy:
 *   DROP TABLE IF EXISTS `user_refresh_tokens`, `users`;
 */
export class DropLegacyUserPermissions1789400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{ id: number }> = await queryRunner.query(
      "SELECT id FROM `permissions` WHERE `module` = 'users'",
    );
    if (!rows.length) return;

    const ids = rows.map((r) => r.id).join(',');
    // Bảng nối role ↔ permission do TypeORM sinh, tên cột có thể khác nhau →
    // dò theo khoá ngoại thay vì viết cứng.
    const joins: Array<{ TABLE_NAME: string; COLUMN_NAME: string }> =
      await queryRunner.query(
        `SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND REFERENCED_TABLE_NAME = 'permissions'`,
      );
    for (const join of joins) {
      await queryRunner.query(
        `DELETE FROM \`${join.TABLE_NAME}\` WHERE \`${join.COLUMN_NAME}\` IN (${ids})`,
      );
    }
    await queryRunner.query(`DELETE FROM \`permissions\` WHERE id IN (${ids})`);
  }

  public async down(): Promise<void> {
    // Quyền sẽ được permission.seed tạo lại nếu module quay lại — không cần phục hồi.
  }
}
