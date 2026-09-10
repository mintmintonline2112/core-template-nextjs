import { MigrationInterface, QueryRunner } from 'typeorm';

const CONTACT_METADATA = {
  location: 'Việt Nam',
  address:
    'Tòa Nhà Doji, Lầu 15, Phòng 1505, 81-83-83B-85 Hàm Nghi, Phường Sài Gòn, TP.HCM',
  email: 'hello@primenuts.vn',
  phone: '090 119 3378',
};

const CONTACT_FIELDS = [
  {
    key: '__self__',
    label: 'Thông tin liên hệ',
    type: 'textMap',
    fields: [
      { name: 'location', label: 'Địa điểm' },
      { name: 'address', label: 'Địa chỉ' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Điện thoại / WhatsApp' },
    ],
  },
];

export class UpdateContactInformation1789200000000
  implements MigrationInterface
{
  name = 'UpdateContactInformation1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE page_sections ps
       INNER JOIN pages p ON p.id = ps.page_id
       SET ps.metadata = ?
       WHERE p.slug = 'contact' AND ps.section_key = 'contact-info'`,
      [JSON.stringify(CONTACT_METADATA)],
    );

    await queryRunner.query(
      `UPDATE section_definitions
       SET description = ?, fields = ?
       WHERE section_key = 'contact-info'`,
      [
        'Địa điểm, địa chỉ, email và điện thoại ở trang Contact.',
        JSON.stringify(CONTACT_FIELDS),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE page_sections ps
       INNER JOIN pages p ON p.id = ps.page_id
       SET ps.metadata = ?
       WHERE p.slug = 'contact' AND ps.section_key = 'contact-info'`,
      [
        JSON.stringify({
          location: 'California, United States',
          email: 'info@primenutsusa.com',
          phone: '+1 (209) 000-0000',
          businessHours: 'Monday – Friday · 8:00 AM – 5:00 PM (Pacific Time)',
        }),
      ],
    );

    await queryRunner.query(
      `UPDATE section_definitions
       SET description = ?, fields = ?
       WHERE section_key = 'contact-info'`,
      [
        'Địa chỉ, email, điện thoại và giờ làm việc ở trang Contact.',
        JSON.stringify([
          {
            key: '__self__',
            label: 'Thông tin liên hệ',
            type: 'textMap',
            fields: [
              { name: 'location', label: 'Địa điểm' },
              { name: 'email', label: 'Email' },
              { name: 'phone', label: 'Điện thoại / WhatsApp' },
              { name: 'businessHours', label: 'Giờ làm việc' },
            ],
          },
        ]),
      ],
    );
  }
}
