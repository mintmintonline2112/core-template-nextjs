import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuoteRequests1789000000000 implements MigrationInterface {
  name = 'CreateQuoteRequests1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`quote_requests\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`company\` varchar(255) NOT NULL,
        \`contact_name\` varchar(255) NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(50) NULL,
        \`country\` varchar(120) NULL,
        \`variety\` varchar(120) NOT NULL,
        \`size_grade\` varchar(120) NULL,
        \`volume\` varchar(255) NOT NULL,
        \`packaging\` varchar(120) NULL,
        \`destination\` varchar(255) NOT NULL,
        \`incoterm\` varchar(20) NULL,
        \`message\` text NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'new',
        INDEX \`IDX_base_deleted\` (\`deleted_at\`),
        INDEX \`IDX_quote_requests_status\` (\`status\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`quote_requests\``);
  }
}
