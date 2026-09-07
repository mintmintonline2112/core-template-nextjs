import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1786036445332 implements MigrationInterface {
    name = 'InitDatabase1786036445332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` varchar(255) NOT NULL, \`token_hash\` varchar(64) NOT NULL, \`expires_at\` timestamp NOT NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` varchar(255) NULL, \`device\` varchar(255) NULL, \`browser\` varchar(255) NULL, \`os\` varchar(255) NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`revoked_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c23fc42230f22896ef533cc752\` (\`token_hash\`), INDEX \`IDX_63b9d4fdb15eb982443754b3f1\` (\`user_id\`, \`is_revoked\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`sort\` int NOT NULL DEFAULT '1', \`full_name\` varchar(255) NOT NULL, \`avatar\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`status\` enum ('active', 'blocked', 'pending', 'inactive') NOT NULL DEFAULT 'inactive', \`phone\` varchar(20) NULL, \`address\` text NULL, \`email_verified_at\` timestamp NULL, \`last_login_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`otp\` varchar(64) NULL, \`otp_expires\` timestamp NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff_refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` text NOT NULL, \`expiresAt\` timestamp NOT NULL, \`isRevoked\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ipAddress\` varchar(255) NULL, \`userAgent\` varchar(255) NULL, \`device\` varchar(255) NULL, \`browser\` varchar(255) NULL, \`os\` varchar(255) NULL, \`staff_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sort\` int NOT NULL DEFAULT '1', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_8dad765629e83229da6feda1c1\` (\`code\`), INDEX \`IDX_8b634526cdd01f2adba6c7ac07\` (\`module\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sort\` int NOT NULL DEFAULT '1', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staffs\` (\`id\` varchar(36) NOT NULL, \`staff_code\` varchar(20) NOT NULL, \`sort\` int NOT NULL DEFAULT '1', \`type\` enum ('admin', 'staff', 'shipper') NOT NULL DEFAULT 'staff', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`status\` enum ('active', 'blocked', 'pending', 'inactive') NOT NULL DEFAULT 'active', \`is_online\` tinyint NOT NULL DEFAULT 0, \`role_id\` int NOT NULL, \`last_login_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_a4866898c9c924ec522162072c\` (\`staff_code\`), UNIQUE INDEX \`IDX_fc7b6dc314d349acb74a6124fe\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sort\` int NOT NULL DEFAULT '1', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`type\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` text NULL, \`user_id\` varchar(255) NULL, \`metadata\` json NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`read_at\` timestamp NULL, INDEX \`IDX_aef1c7aef3725068e5540f8f00\` (\`type\`), INDEX \`IDX_1b46535f0781ddceee2a69e20f\` (\`module\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contacts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fullname\` varchar(255) NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`subject\` varchar(255) NULL, \`message\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sort\` int NOT NULL DEFAULT '1', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NULL, \`description\` text NULL, \`is_active\` tinyint(4) NOT NULL DEFAULT '1', \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, \`meta_keywords\` varchar(255) NULL, \`og_image\` varchar(255) NULL, \`canonical_url\` varchar(255) NULL, \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_0178208684bd3fcacaa7581fce\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`articles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sort\` int NOT NULL DEFAULT '1', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`category_id\` int NULL, \`slug\` varchar(255) NULL, \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, \`meta_keywords\` varchar(255) NULL, \`og_image\` varchar(255) NULL, \`canonical_url\` varchar(255) NULL, \`type\` enum ('blog', 'article', 'timeline') NOT NULL DEFAULT 'article', \`image\` varchar(255) NULL, \`description\` text NULL, \`metadata\` json NULL, UNIQUE INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`permission_id\` int NOT NULL, \`role_id\` int NOT NULL, INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`), INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`), PRIMARY KEY (\`permission_id\`, \`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_refresh_tokens\` ADD CONSTRAINT \`FK_15ffbf3cf712c581611caf2130a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_refresh_tokens\` ADD CONSTRAINT \`FK_a8a1ae310391e175124623e1850\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staffs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staffs\` ADD CONSTRAINT \`FK_346ddd9d261ae4468d03f50bb41\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_e025eeefcdb2a269c42484ee43f\` FOREIGN KEY (\`category_id\`) REFERENCES \`article_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_e025eeefcdb2a269c42484ee43f\``);
        await queryRunner.query(`ALTER TABLE \`staffs\` DROP FOREIGN KEY \`FK_346ddd9d261ae4468d03f50bb41\``);
        await queryRunner.query(`ALTER TABLE \`staff_refresh_tokens\` DROP FOREIGN KEY \`FK_a8a1ae310391e175124623e1850\``);
        await queryRunner.query(`ALTER TABLE \`user_refresh_tokens\` DROP FOREIGN KEY \`FK_15ffbf3cf712c581611caf2130a\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` ON \`articles\``);
        await queryRunner.query(`DROP TABLE \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_0178208684bd3fcacaa7581fce\` ON \`article_categories\``);
        await queryRunner.query(`DROP TABLE \`article_categories\``);
        await queryRunner.query(`DROP TABLE \`contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b46535f0781ddceee2a69e20f\` ON \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_aef1c7aef3725068e5540f8f00\` ON \`notifications\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_fc7b6dc314d349acb74a6124fe\` ON \`staffs\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4866898c9c924ec522162072c\` ON \`staffs\``);
        await queryRunner.query(`DROP TABLE \`staffs\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b634526cdd01f2adba6c7ac07\` ON \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_8dad765629e83229da6feda1c1\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`staff_refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_63b9d4fdb15eb982443754b3f1\` ON \`user_refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_c23fc42230f22896ef533cc752\` ON \`user_refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`user_refresh_tokens\``);
    }

}
