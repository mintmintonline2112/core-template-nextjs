import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSiteSettings1786400000000 implements MigrationInterface {
  name = 'CreateSiteSettings1786400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`site_settings\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`key\` varchar(120) NOT NULL,
        \`value\` json NOT NULL,
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`UQ_site_settings_key\` (\`key\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`site_settings\``);
  }
}
