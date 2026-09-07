import { CreateQuoteRequestDto } from 'src/modules/admin/quote-requests/dto/create-quote-request.dto';

/** Email thông báo nội bộ khi có yêu cầu báo giá B2B mới từ website. */
export function quoteRequestTemplate(data: CreateQuoteRequestDto): string {
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr>
          <td style="padding:6px 12px;color:#6C7563;white-space:nowrap;">${label}</td>
          <td style="padding:6px 12px;color:#1F2B1D;"><strong>${value}</strong></td>
        </tr>`
      : '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #E4DFCC;border-radius:8px;overflow:hidden;">
    <div style="background:#295328;color:#F5F1E3;padding:16px 24px;">
      <h2 style="margin:0;font-size:18px;">New B2B Quote Request</h2>
    </div>
    <table style="width:100%;border-collapse:collapse;padding:8px 12px;">
      ${row('Company', data.company)}
      ${row('Contact', data.contactName)}
      ${row('Email', data.email)}
      ${row('Phone', data.phone)}
      ${row('Country', data.country)}
      ${row('Variety', data.variety)}
      ${row('Size & Grade', data.sizeGrade)}
      ${row('Volume', data.volume)}
      ${row('Packaging', data.packaging)}
      ${row('Destination', data.destination)}
      ${row('Incoterm', data.incoterm)}
      ${row('Message', data.message)}
    </table>
    <div style="padding:12px 24px;background:#FAF7EE;color:#6C7563;font-size:12px;">
      © ${new Date().getFullYear()} Prime Nuts USA — sent automatically from the website quote form.
    </div>
  </div>`;
}
