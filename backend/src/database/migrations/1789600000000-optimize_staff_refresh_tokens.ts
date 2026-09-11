import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bảng `staff_refresh_tokens` trước đây chỉ thêm, không bao giờ bớt: mỗi lần đăng
 * nhập chèn một hàng, đăng xuất chỉ bật cờ `isRevoked`, hàng hết hạn nằm lại mãi.
 * Token lại lưu dạng băm bcrypt nên muốn tìm hàng tương ứng phải đọc cả bảng rồi
 * so từng hàng — đăng xuất chậm dần theo tổng số lần đăng nhập của cả hệ thống.
 *
 * Migration này thêm `session_id` (nhúng luôn trong refresh token) để tra bằng chỉ
 * mục thay vì quét, thêm chỉ mục theo hạn dùng cho việc dọn hàng hết hạn, và bỏ
 * `isRevoked` vì đăng xuất giờ xoá hẳn hàng.
 *
 * Cột `token` cũng đổi sang `token_hash` chứa SHA-256. Trước đây nó chứa băm
 * bcrypt, mà bcrypt chỉ đọc 72 byte đầu của chuỗi — 72 byte đầu của mọi refresh
 * token cùng một nhân viên thì giống hệt nhau, nên phép so gần như luôn đúng dù
 * token khác. Nói cách khác bản cũ không thật sự xác thực được token nào cả.
 */
export class OptimizeStaffRefreshTokens1789600000000 implements MigrationInterface {
  name = 'OptimizeStaffRefreshTokens1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Refresh token đang lưu hành không mang `session_id` nên sau migration không
    // tra được nữa. Xoá sạch để mọi người đăng nhập lại đúng một lần, thay vì để
    // lại những hàng không bao giờ khớp với ai.
    await queryRunner.query(`DELETE FROM \`staff_refresh_tokens\``);

    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` ADD \`session_id\` varchar(64) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_staff_refresh_session\` ON \`staff_refresh_tokens\` (\`session_id\`)`,
    );
    // Không thêm chỉ mục (staff_id, createdAt): MySQL 8 sẽ tự bỏ chỉ mục khoá ngoại
    // vì thấy thừa, và khi gỡ migration sẽ không xoá nổi chỉ mục ghép do khoá ngoại
    // đang bám vào. Chỉ mục khoá ngoại sẵn có đã đủ cho truy vấn dọn phiên.
    await queryRunner.query(
      `CREATE INDEX \`IDX_staff_refresh_expires\` ON \`staff_refresh_tokens\` (\`expiresAt\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` DROP COLUMN \`isRevoked\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` CHANGE \`token\` \`token_hash\` varchar(64) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` CHANGE \`token_hash\` \`token\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` ADD \`isRevoked\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_staff_refresh_expires\` ON \`staff_refresh_tokens\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_staff_refresh_session\` ON \`staff_refresh_tokens\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`staff_refresh_tokens\` DROP COLUMN \`session_id\``,
    );
  }
}
