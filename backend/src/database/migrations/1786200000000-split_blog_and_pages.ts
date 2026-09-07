import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Split the legacy Article model into two explicit domains:
 * - blog_posts/blog_categories
 * - pages/page_sections
 *
 * This migration preserves legacy rows. Article/timeline rows become pages,
 * while blog rows remain in blog_posts.
 */
export class SplitBlogAndPages1786200000000 implements MigrationInterface {
  name = 'SplitBlogAndPages1786200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `staffs` DROP FOREIGN KEY `FK_346ddd9d261ae4468d03f50bb41`',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_178199805b901ccd220ab7740ec`',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_17022daf3f885f7d35423e9971e`',
    );
    await queryRunner.query(`
      ALTER TABLE \`permissions\`
        CHANGE \`id\` \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        CHANGE \`sort\` \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        CHANGE \`createdAt\` \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updatedAt\` \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        ADD \`deleted_at\` DATETIME(6) NULL AFTER \`updated_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`roles\`
        CHANGE \`id\` \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        CHANGE \`sort\` \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        CHANGE \`createdAt\` \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updatedAt\` \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        ADD \`deleted_at\` DATETIME(6) NULL AFTER \`updated_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`notifications\`
        CHANGE \`id\` \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        CHANGE \`sort\` \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        CHANGE \`createdAt\` \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updatedAt\` \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        ADD \`deleted_at\` DATETIME(6) NULL AFTER \`updated_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`role_permissions\`
        MODIFY \`permission_id\` INT UNSIGNED NOT NULL,
        MODIFY \`role_id\` INT UNSIGNED NOT NULL
    `);
    await queryRunner.query(
      'ALTER TABLE `staffs` MODIFY `role_id` INT UNSIGNED NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_base_deleted` ON `permissions` (`deleted_at`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_base_deleted` ON `roles` (`deleted_at`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_base_deleted` ON `notifications` (`deleted_at`)',
    );
    await queryRunner.query(
      'ALTER TABLE `staffs` ADD CONSTRAINT `FK_346ddd9d261ae4468d03f50bb41` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_17022daf3f885f7d35423e9971e` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_178199805b901ccd220ab7740ec` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      "UPDATE `staffs` SET `type` = 'staff' WHERE `type` = 'shipper'",
    );
    await queryRunner.query(
      "ALTER TABLE `staffs` MODIFY `type` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff'",
    );

    await queryRunner.query(
      'ALTER TABLE `articles` DROP FOREIGN KEY `FK_e025eeefcdb2a269c42484ee43f`',
    );
    await queryRunner.query(
      'RENAME TABLE `article_categories` TO `blog_categories`, `articles` TO `blog_posts`',
    );

    await queryRunner.query(
      'UPDATE `blog_categories` SET `slug` = CONCAT("category-", `id`) WHERE `slug` IS NULL OR `slug` = ""',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_categories\`
        CHANGE \`id\` \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        ADD \`parent_id\` INT UNSIGNED NULL AFTER \`id\`,
        CHANGE \`sort\` \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        CHANGE \`createdAt\` \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updatedAt\` \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        MODIFY \`slug\` VARCHAR(255) NOT NULL,
        MODIFY \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        CHANGE \`og_image\` \`og_image_path\` VARCHAR(500) NULL,
        MODIFY \`canonical_url\` VARCHAR(500) NULL,
        DROP COLUMN \`meta_keywords\`
    `);
    await queryRunner.query(
      'DROP INDEX `IDX_0178208684bd3fcacaa7581fce` ON `blog_categories`',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_blog_categories_slug` ON `blog_categories` (`slug`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_blog_categories_parent` ON `blog_categories` (`parent_id`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_blog_categories_active` ON `blog_categories` (`is_active`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_base_deleted` ON `blog_categories` (`deleted_at`)',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_categories\`
        ADD CONSTRAINT \`FK_blog_categories_parent\`
        FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_categories\`(\`id\`)
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      'UPDATE `blog_posts` SET `slug` = CONCAT("content-", `id`) WHERE `slug` IS NULL OR `slug` = ""',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_posts\`
        CHANGE \`id\` \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        CHANGE \`category_id\` \`category_id\` INT UNSIGNED NULL,
        ADD \`author_staff_id\` VARCHAR(36) NULL AFTER \`category_id\`,
        CHANGE \`sort\` \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        CHANGE \`createdAt\` \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updatedAt\` \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        ADD \`deleted_at\` DATETIME(6) NULL AFTER \`updated_at\`,
        CHANGE \`name\` \`title\` VARCHAR(255) NOT NULL,
        MODIFY \`slug\` VARCHAR(255) NOT NULL,
        CHANGE \`description\` \`excerpt\` TEXT NULL,
        ADD \`content\` LONGTEXT NULL AFTER \`excerpt\`,
        CHANGE \`image\` \`cover_image_path\` VARCHAR(500) NULL,
        ADD \`status\` VARCHAR(32) NOT NULL DEFAULT 'draft',
        ADD \`published_at\` DATETIME(6) NULL,
        CHANGE \`og_image\` \`og_image_path\` VARCHAR(500) NULL,
        MODIFY \`canonical_url\` VARCHAR(500) NULL,
        DROP COLUMN \`meta_keywords\`
    `);
    await queryRunner.query(
      'UPDATE `blog_posts` SET `content` = COALESCE(`excerpt`, ""), `status` = "published", `published_at` = `created_at`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_1123ff6815c5b8fec0ba9fec37` ON `blog_posts`',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_seo_content_slug` ON `blog_posts` (`slug`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_base_deleted` ON `blog_posts` (`deleted_at`)',
    );

    await queryRunner.query(`
      CREATE TABLE \`pages\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` DATETIME(6) NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`status\` VARCHAR(32) NOT NULL DEFAULT 'draft',
        \`meta_title\` VARCHAR(255) NULL,
        \`meta_description\` VARCHAR(320) NULL,
        \`og_image_path\` VARCHAR(500) NULL,
        \`canonical_url\` VARCHAR(500) NULL,
        \`eyebrow\` VARCHAR(160) NULL,
        \`lead\` TEXT NULL,
        \`template_key\` VARCHAR(120) NULL,
        UNIQUE INDEX \`UQ_seo_content_slug\` (\`slug\`),
        INDEX \`IDX_seo_content_status\` (\`status\`),
        INDEX \`IDX_base_deleted\` (\`deleted_at\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`page_sections\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` DATETIME(6) NULL,
        \`page_id\` INT UNSIGNED NOT NULL,
        \`section_key\` VARCHAR(120) NOT NULL,
        \`heading\` VARCHAR(255) NULL,
        \`subheading\` VARCHAR(255) NULL,
        \`content\` LONGTEXT NULL,
        \`media_path\` VARCHAR(500) NULL,
        \`metadata\` JSON NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        UNIQUE INDEX \`UQ_page_sections_key\` (\`page_id\`, \`section_key\`),
        INDEX \`IDX_page_sections_listing\` (\`page_id\`, \`is_active\`, \`sort_order\`),
        INDEX \`IDX_base_deleted\` (\`deleted_at\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`page_sections\`
        ADD CONSTRAINT \`FK_page_sections_page\`
        FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      INSERT INTO \`pages\` (
        \`sort_order\`, \`created_at\`, \`updated_at\`, \`title\`, \`slug\`,
        \`status\`, \`meta_title\`, \`meta_description\`, \`og_image_path\`,
        \`canonical_url\`, \`lead\`, \`template_key\`
      )
      SELECT
        \`sort_order\`, \`created_at\`, \`updated_at\`, \`title\`, \`slug\`,
        'published', \`meta_title\`, \`meta_description\`, \`og_image_path\`,
        \`canonical_url\`, \`excerpt\`,
        CASE WHEN \`type\` = 'timeline' THEN 'timeline' ELSE 'content-page' END
      FROM \`blog_posts\`
      WHERE \`type\` IN ('article', 'timeline')
    `);
    await queryRunner.query(`
      INSERT INTO \`page_sections\` (
        \`page_id\`, \`section_key\`, \`heading\`, \`content\`, \`metadata\`,
        \`sort_order\`, \`created_at\`, \`updated_at\`
      )
      SELECT
        p.\`id\`,
        CASE WHEN b.\`type\` = 'timeline' THEN 'timeline' ELSE 'content' END,
        b.\`title\`, b.\`content\`, b.\`metadata\`, 0, b.\`created_at\`, b.\`updated_at\`
      FROM \`blog_posts\` b
      INNER JOIN \`pages\` p ON p.\`slug\` = b.\`slug\`
      WHERE b.\`type\` IN ('article', 'timeline')
    `);
    await queryRunner.query(
      "DELETE FROM `blog_posts` WHERE `type` IN ('article', 'timeline')",
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_posts\`
        DROP COLUMN \`type\`,
        MODIFY \`content\` LONGTEXT NOT NULL
    `);

    await queryRunner.query(
      'CREATE INDEX `IDX_seo_content_status` ON `blog_posts` (`status`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_blog_posts_publish` ON `blog_posts` (`status`, `published_at`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_blog_posts_category_publish` ON `blog_posts` (`category_id`, `status`, `published_at`)',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_posts\`
        ADD CONSTRAINT \`FK_blog_posts_category\`
        FOREIGN KEY (\`category_id\`) REFERENCES \`blog_categories\`(\`id\`)
        ON DELETE SET NULL ON UPDATE NO ACTION,
        ADD CONSTRAINT \`FK_blog_posts_author\`
        FOREIGN KEY (\`author_staff_id\`) REFERENCES \`staffs\`(\`id\`)
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `blog_posts` DROP FOREIGN KEY `FK_blog_posts_author`',
    );
    await queryRunner.query(
      'ALTER TABLE `blog_posts` DROP FOREIGN KEY `FK_blog_posts_category`',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_posts\`
        ADD \`type\` ENUM('blog', 'article', 'timeline') NOT NULL DEFAULT 'blog' AFTER \`canonical_url\`
    `);

    await queryRunner.query(`
      INSERT INTO \`blog_posts\` (
        \`sort_order\`, \`created_at\`, \`updated_at\`, \`title\`, \`slug\`,
        \`meta_title\`, \`meta_description\`, \`og_image_path\`, \`canonical_url\`,
        \`type\`, \`excerpt\`, \`content\`, \`status\`, \`published_at\`
      )
      SELECT
        p.\`sort_order\`, p.\`created_at\`, p.\`updated_at\`, p.\`title\`, p.\`slug\`,
        p.\`meta_title\`, p.\`meta_description\`, p.\`og_image_path\`, p.\`canonical_url\`,
        CASE WHEN p.\`template_key\` = 'timeline' THEN 'timeline' ELSE 'article' END,
        p.\`lead\`, COALESCE(s.\`content\`, p.\`lead\`, ''), p.\`status\`, p.\`created_at\`
      FROM \`pages\` p
      LEFT JOIN \`page_sections\` s
        ON s.\`page_id\` = p.\`id\` AND s.\`sort_order\` = 0
      WHERE NOT EXISTS (
        SELECT 1 FROM \`blog_posts\` b WHERE b.\`slug\` = p.\`slug\`
      )
    `);

    await queryRunner.query(
      'ALTER TABLE `page_sections` DROP FOREIGN KEY `FK_page_sections_page`',
    );
    await queryRunner.query('DROP TABLE `page_sections`');
    await queryRunner.query('DROP TABLE `pages`');

    await queryRunner.query(
      'DROP INDEX `IDX_blog_posts_category_publish` ON `blog_posts`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_blog_posts_publish` ON `blog_posts`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_seo_content_status` ON `blog_posts`',
    );
    await queryRunner.query('DROP INDEX `UQ_seo_content_slug` ON `blog_posts`');
    await queryRunner.query(`
      ALTER TABLE \`blog_posts\`
        CHANGE \`id\` \`id\` INT NOT NULL AUTO_INCREMENT,
        CHANGE \`category_id\` \`category_id\` INT NULL,
        CHANGE \`sort_order\` \`sort\` INT NOT NULL DEFAULT 1,
        CHANGE \`created_at\` \`createdAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updated_at\` \`updatedAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CHANGE \`title\` \`name\` VARCHAR(255) NOT NULL,
        CHANGE \`excerpt\` \`description\` TEXT NULL,
        CHANGE \`cover_image_path\` \`image\` VARCHAR(255) NULL,
        CHANGE \`og_image_path\` \`og_image\` VARCHAR(255) NULL,
        MODIFY \`canonical_url\` VARCHAR(255) NULL,
        ADD \`meta_keywords\` VARCHAR(255) NULL AFTER \`meta_description\`,
        DROP COLUMN \`author_staff_id\`,
        DROP COLUMN \`content\`,
        DROP COLUMN \`status\`,
        DROP COLUMN \`published_at\`,
        DROP COLUMN \`deleted_at\`
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_1123ff6815c5b8fec0ba9fec37` ON `blog_posts` (`slug`)',
    );

    await queryRunner.query(
      'ALTER TABLE `blog_categories` DROP FOREIGN KEY `FK_blog_categories_parent`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_blog_categories_active` ON `blog_categories`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_blog_categories_parent` ON `blog_categories`',
    );
    await queryRunner.query(
      'DROP INDEX `UQ_blog_categories_slug` ON `blog_categories`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_base_deleted` ON `blog_categories`',
    );
    await queryRunner.query(`
      ALTER TABLE \`blog_categories\`
        CHANGE \`id\` \`id\` INT NOT NULL AUTO_INCREMENT,
        CHANGE \`sort_order\` \`sort\` INT NOT NULL DEFAULT 1,
        CHANGE \`created_at\` \`createdAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updated_at\` \`updatedAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CHANGE \`og_image_path\` \`og_image\` VARCHAR(255) NULL,
        MODIFY \`canonical_url\` VARCHAR(255) NULL,
        ADD \`meta_keywords\` VARCHAR(255) NULL AFTER \`meta_description\`,
        DROP COLUMN \`parent_id\`
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_0178208684bd3fcacaa7581fce` ON `blog_categories` (`slug`)',
    );

    await queryRunner.query(
      'RENAME TABLE `blog_categories` TO `article_categories`, `blog_posts` TO `articles`',
    );
    await queryRunner.query(`
      ALTER TABLE \`articles\`
        ADD CONSTRAINT \`FK_e025eeefcdb2a269c42484ee43f\`
        FOREIGN KEY (\`category_id\`) REFERENCES \`article_categories\`(\`id\`)
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      'ALTER TABLE `staffs` DROP FOREIGN KEY `FK_346ddd9d261ae4468d03f50bb41`',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_178199805b901ccd220ab7740ec`',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_17022daf3f885f7d35423e9971e`',
    );
    await queryRunner.query('DROP INDEX `IDX_base_deleted` ON `notifications`');
    await queryRunner.query('DROP INDEX `IDX_base_deleted` ON `roles`');
    await queryRunner.query('DROP INDEX `IDX_base_deleted` ON `permissions`');
    await queryRunner.query(`
      ALTER TABLE \`role_permissions\`
        MODIFY \`permission_id\` INT NOT NULL,
        MODIFY \`role_id\` INT NOT NULL
    `);
    await queryRunner.query(
      'ALTER TABLE `staffs` MODIFY `role_id` INT NOT NULL',
    );
    await queryRunner.query(`
      ALTER TABLE \`notifications\`
        CHANGE \`id\` \`id\` INT NOT NULL AUTO_INCREMENT,
        CHANGE \`sort_order\` \`sort\` INT NOT NULL DEFAULT 1,
        CHANGE \`created_at\` \`createdAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updated_at\` \`updatedAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        DROP COLUMN \`deleted_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`roles\`
        CHANGE \`id\` \`id\` INT NOT NULL AUTO_INCREMENT,
        CHANGE \`sort_order\` \`sort\` INT NOT NULL DEFAULT 1,
        CHANGE \`created_at\` \`createdAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updated_at\` \`updatedAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        DROP COLUMN \`deleted_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`permissions\`
        CHANGE \`id\` \`id\` INT NOT NULL AUTO_INCREMENT,
        CHANGE \`sort_order\` \`sort\` INT NOT NULL DEFAULT 1,
        CHANGE \`created_at\` \`createdAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CHANGE \`updated_at\` \`updatedAt\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        DROP COLUMN \`deleted_at\`
    `);
    await queryRunner.query(
      'ALTER TABLE `staffs` ADD CONSTRAINT `FK_346ddd9d261ae4468d03f50bb41` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_17022daf3f885f7d35423e9971e` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_178199805b901ccd220ab7740ec` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      "ALTER TABLE `staffs` MODIFY `type` ENUM('admin', 'staff', 'shipper') NOT NULL DEFAULT 'staff'",
    );
  }
}
