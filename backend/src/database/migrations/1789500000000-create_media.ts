import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bảng chỉ mục thư viện media. Trước đây mỗi lần mở Thư viện, backend quét đệ
 * quy cả thư mục uploads/ và stat() từng file — chậm dần theo số file và không
 * lưu được alt text. Bảng này giữ chỉ mục; ổ đĩa vẫn là nguồn sự thật, đồng bộ
 * bằng LibraryService.sync().
 */
export class CreateMedia1789500000000 implements MigrationInterface {
  name = 'CreateMedia1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`media\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`path\` varchar(500) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`folder\` varchar(190) NOT NULL DEFAULT 'root',
        \`kind\` varchar(10) NOT NULL,
        \`extension\` varchar(16) NOT NULL,
        \`mime_type\` varchar(120) NULL,
        \`size\` int UNSIGNED NOT NULL DEFAULT 0,
        \`width\` int UNSIGNED NULL,
        \`height\` int UNSIGNED NULL,
        \`alt\` varchar(300) NULL,
        \`uploaded_by_staff_id\` varchar(36) NULL,
        \`modified_at\` datetime(6) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`UQ_media_path\` (\`path\`),
        INDEX \`IDX_media_kind_created\` (\`kind\`, \`created_at\`),
        INDEX \`IDX_media_folder\` (\`folder\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`media\``);
  }
}
