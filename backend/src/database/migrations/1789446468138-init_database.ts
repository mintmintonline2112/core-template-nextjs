import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1789446468138 implements MigrationInterface {
    name = 'InitDatabase1789446468138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`staff_refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`session_id\` varchar(64) NOT NULL, \`token_hash\` varchar(64) NOT NULL, \`previous_token_hash\` varchar(64) NULL, \`rotated_at\` datetime(6) NULL, \`expiresAt\` timestamp NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ipAddress\` varchar(255) NULL, \`userAgent\` varchar(255) NULL, \`device\` varchar(255) NULL, \`browser\` varchar(255) NULL, \`os\` varchar(255) NULL, \`staff_id\` varchar(36) NULL, UNIQUE INDEX \`UQ_staff_refresh_session\` (\`session_id\`), INDEX \`IDX_staff_refresh_expires\` (\`expiresAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`IDX_8dad765629e83229da6feda1c1\` (\`code\`), INDEX \`IDX_8b634526cdd01f2adba6c7ac07\` (\`module\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staffs\` (\`id\` varchar(36) NOT NULL, \`staff_code\` varchar(20) NOT NULL, \`sort\` int NOT NULL DEFAULT '1', \`type\` enum ('admin', 'staff') NOT NULL DEFAULT 'staff', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`status\` enum ('active', 'blocked', 'pending', 'inactive') NOT NULL DEFAULT 'active', \`is_online\` tinyint NOT NULL DEFAULT 0, \`role_id\` int UNSIGNED NOT NULL, \`last_login_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_a4866898c9c924ec522162072c\` (\`staff_code\`), UNIQUE INDEX \`IDX_fc7b6dc314d349acb74a6124fe\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`site_settings\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`key\` varchar(120) NOT NULL, \`value\` json NOT NULL, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`UQ_site_settings_key\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`quote_requests\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`company\` varchar(255) NOT NULL, \`contact_name\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(50) NULL, \`country\` varchar(120) NULL, \`variety\` varchar(120) NOT NULL, \`size_grade\` varchar(120) NULL, \`volume\` varchar(255) NOT NULL, \`packaging\` varchar(120) NULL, \`destination\` varchar(255) NOT NULL, \`incoterm\` varchar(20) NULL, \`message\` text NULL, \`status\` varchar(20) NOT NULL DEFAULT 'new', INDEX \`IDX_base_deleted\` (\`deleted_at\`), INDEX \`IDX_quote_requests_status\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`section_definitions\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`page_slug\` varchar(120) NOT NULL, \`section_key\` varchar(120) NOT NULL, \`label\` varchar(160) NOT NULL, \`description\` text NULL, \`fields\` json NOT NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`UQ_section_definitions_key\` (\`section_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`page_sections\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`page_id\` int UNSIGNED NOT NULL, \`section_key\` varchar(120) NOT NULL, \`heading\` varchar(255) NULL, \`subheading\` varchar(255) NULL, \`content\` longtext NULL, \`media_path\` varchar(500) NULL, \`metadata\` json NULL, \`translations\` json NULL, \`is_active\` tinyint(1) NOT NULL DEFAULT '1', INDEX \`IDX_base_deleted\` (\`deleted_at\`), INDEX \`IDX_page_sections_listing\` (\`page_id\`, \`is_active\`, \`sort_order\`), UNIQUE INDEX \`UQ_page_sections_key\` (\`page_id\`, \`section_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pages\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`status\` varchar(32) NOT NULL DEFAULT 'draft', \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, \`og_image_path\` varchar(500) NULL, \`canonical_url\` varchar(500) NULL, \`eyebrow\` varchar(160) NULL, \`lead\` text NULL, \`template_key\` varchar(120) NULL, \`translations\` json NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`UQ_seo_content_slug\` (\`slug\`), INDEX \`IDX_seo_content_status\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`menu_items\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`label\` varchar(160) NOT NULL, \`href\` varchar(500) NOT NULL, \`parent_id\` int UNSIGNED NULL, \`description\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`translations\` json NULL, \`show_submenu\` tinyint NOT NULL DEFAULT 1, INDEX \`IDX_base_deleted\` (\`deleted_at\`), INDEX \`IDX_menu_items_parent\` (\`parent_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`type\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` text NULL, \`user_id\` varchar(255) NULL, \`metadata\` json NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`read_at\` timestamp NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), INDEX \`IDX_aef1c7aef3725068e5540f8f00\` (\`type\`), INDEX \`IDX_1b46535f0781ddceee2a69e20f\` (\`module\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`media\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`path\` varchar(500) NOT NULL, \`name\` varchar(255) NOT NULL, \`folder\` varchar(190) NOT NULL DEFAULT 'root', \`kind\` varchar(10) NOT NULL, \`extension\` varchar(16) NOT NULL, \`mime_type\` varchar(120) NULL, \`size\` int UNSIGNED NOT NULL DEFAULT '0', \`width\` int UNSIGNED NULL, \`height\` int UNSIGNED NULL, \`alt\` varchar(300) NULL, \`uploaded_by_staff_id\` varchar(36) NULL, \`modified_at\` datetime(6) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`UQ_media_path\` (\`path\`), INDEX \`IDX_media_folder\` (\`folder\`), INDEX \`IDX_media_kind_created\` (\`kind\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_categories\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`display_name\` varchar(255) NULL, \`slug\` varchar(255) NOT NULL, \`parent_id\` int UNSIGNED NULL, \`description\` text NULL, \`is_active\` tinyint(1) NOT NULL DEFAULT '1', \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, \`og_image_path\` varchar(500) NULL, \`canonical_url\` varchar(500) NULL, \`translations\` json NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`UQ_blog_categories_slug\` (\`slug\`), INDEX \`IDX_blog_categories_active\` (\`is_active\`), INDEX \`IDX_blog_categories_parent\` (\`parent_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_posts\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`status\` varchar(32) NOT NULL DEFAULT 'draft', \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, \`og_image_path\` varchar(500) NULL, \`canonical_url\` varchar(500) NULL, \`category_id\` int UNSIGNED NULL, \`author_staff_id\` varchar(36) NULL, \`excerpt\` text NULL, \`content\` longtext NOT NULL, \`cover_image_path\` varchar(500) NULL, \`video_path\` varchar(500) NULL, \`video_orientation\` varchar(20) NULL, \`published_at\` datetime(6) NULL, \`translations\` json NULL, \`metadata\` json NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`UQ_seo_content_slug\` (\`slug\`), INDEX \`IDX_seo_content_status\` (\`status\`), INDEX \`IDX_blog_posts_category_publish\` (\`category_id\`, \`status\`, \`published_at\`), INDEX \`IDX_blog_posts_publish\` (\`status\`, \`published_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contacts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fullname\` varchar(255) NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`subject\` varchar(255) NULL, \`message\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`role_id\` int UNSIGNED NOT NULL, \`permission_id\` int UNSIGNED NOT NULL, INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`), INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`staff_refresh_tokens\` ADD CONSTRAINT \`FK_a8a1ae310391e175124623e1850\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staffs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staffs\` ADD CONSTRAINT \`FK_346ddd9d261ae4468d03f50bb41\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`page_sections\` ADD CONSTRAINT \`FK_page_sections_page\` FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_8e20ca40202c116fdafe92cdc4e\` FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_categories\` ADD CONSTRAINT \`FK_blog_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD CONSTRAINT \`FK_blog_posts_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD CONSTRAINT \`FK_blog_posts_author\` FOREIGN KEY (\`author_staff_id\`) REFERENCES \`staffs\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP FOREIGN KEY \`FK_blog_posts_author\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP FOREIGN KEY \`FK_blog_posts_category\``);
        await queryRunner.query(`ALTER TABLE \`blog_categories\` DROP FOREIGN KEY \`FK_blog_categories_parent\``);
        await queryRunner.query(`ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_8e20ca40202c116fdafe92cdc4e\``);
        await queryRunner.query(`ALTER TABLE \`page_sections\` DROP FOREIGN KEY \`FK_page_sections_page\``);
        await queryRunner.query(`ALTER TABLE \`staffs\` DROP FOREIGN KEY \`FK_346ddd9d261ae4468d03f50bb41\``);
        await queryRunner.query(`ALTER TABLE \`staff_refresh_tokens\` DROP FOREIGN KEY \`FK_a8a1ae310391e175124623e1850\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_blog_posts_publish\` ON \`blog_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_blog_posts_category_publish\` ON \`blog_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_seo_content_status\` ON \`blog_posts\``);
        await queryRunner.query(`DROP INDEX \`UQ_seo_content_slug\` ON \`blog_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`blog_posts\``);
        await queryRunner.query(`DROP TABLE \`blog_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_blog_categories_parent\` ON \`blog_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_blog_categories_active\` ON \`blog_categories\``);
        await queryRunner.query(`DROP INDEX \`UQ_blog_categories_slug\` ON \`blog_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`blog_categories\``);
        await queryRunner.query(`DROP TABLE \`blog_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_media_kind_created\` ON \`media\``);
        await queryRunner.query(`DROP INDEX \`IDX_media_folder\` ON \`media\``);
        await queryRunner.query(`DROP INDEX \`UQ_media_path\` ON \`media\``);
        await queryRunner.query(`DROP TABLE \`media\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b46535f0781ddceee2a69e20f\` ON \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_aef1c7aef3725068e5540f8f00\` ON \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`notifications\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_menu_items_parent\` ON \`menu_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`menu_items\``);
        await queryRunner.query(`DROP TABLE \`menu_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_seo_content_status\` ON \`pages\``);
        await queryRunner.query(`DROP INDEX \`UQ_seo_content_slug\` ON \`pages\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`pages\``);
        await queryRunner.query(`DROP TABLE \`pages\``);
        await queryRunner.query(`DROP INDEX \`UQ_page_sections_key\` ON \`page_sections\``);
        await queryRunner.query(`DROP INDEX \`IDX_page_sections_listing\` ON \`page_sections\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`page_sections\``);
        await queryRunner.query(`DROP TABLE \`page_sections\``);
        await queryRunner.query(`DROP INDEX \`UQ_section_definitions_key\` ON \`section_definitions\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`section_definitions\``);
        await queryRunner.query(`DROP TABLE \`section_definitions\``);
        await queryRunner.query(`DROP INDEX \`IDX_quote_requests_status\` ON \`quote_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`quote_requests\``);
        await queryRunner.query(`DROP TABLE \`quote_requests\``);
        await queryRunner.query(`DROP INDEX \`UQ_site_settings_key\` ON \`site_settings\``);
        await queryRunner.query(`DROP TABLE \`site_settings\``);
        await queryRunner.query(`DROP INDEX \`IDX_fc7b6dc314d349acb74a6124fe\` ON \`staffs\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4866898c9c924ec522162072c\` ON \`staffs\``);
        await queryRunner.query(`DROP TABLE \`staffs\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b634526cdd01f2adba6c7ac07\` ON \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_8dad765629e83229da6feda1c1\` ON \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_base_deleted\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_staff_refresh_expires\` ON \`staff_refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`UQ_staff_refresh_session\` ON \`staff_refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`staff_refresh_tokens\``);
    }

}
