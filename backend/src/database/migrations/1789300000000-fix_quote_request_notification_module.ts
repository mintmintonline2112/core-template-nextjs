import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thông báo yêu cầu báo giá cũ ghi module = 'quoterequests', trong khi quyền
 * sinh ra từ AdminQuoteRequestsController là 'adminquoterequests' → chuông lọc
 * theo module nên không ai nhìn thấy. Đổi lại cho khớp.
 */
export class FixQuoteRequestNotificationModule1789300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `notifications` SET `module` = 'adminquoterequests' WHERE `module` = 'quoterequests'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `notifications` SET `module` = 'quoterequests' WHERE `module` = 'adminquoterequests'",
    );
  }
}
