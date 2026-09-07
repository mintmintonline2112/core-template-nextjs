import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bài viết: video kèm theo (tùy chọn). `video_path` = đường dẫn file đã upload
 * (uploads/videos/...) hoặc link YouTube/Vimeo; `video_orientation` =
 * landscape (16:9) | portrait (9:16) để public chọn khung hiển thị.
 */
export class AddBlogPostVideo1786800000000 implements MigrationInterface {
  name = 'AddBlogPostVideo1786800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `blog_posts` ADD `video_path` varchar(500) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `blog_posts` ADD `video_orientation` varchar(20) NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `blog_posts` DROP COLUMN `video_orientation`',
    );
    await queryRunner.query('ALTER TABLE `blog_posts` DROP COLUMN `video_path`');
  }
}
