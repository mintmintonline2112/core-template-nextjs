import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

export enum QuoteRequestStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  QUOTED = 'quoted',
  CLOSED = 'closed',
}

/** Yêu cầu báo giá B2B từ form "Request a B2B Quote" trên website. */
@Entity('quote_requests')
export class QuoteRequest extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  company: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  country: string | null;

  /** Nonpareil / Carmel / Monterey / California Varieties / ... */
  @Column({ type: 'varchar', length: 120 })
  variety: string;

  /** 18/20, 20/22, ... hoặc mô tả grade tùy ý. */
  @Column({ name: 'size_grade', type: 'varchar', length: 120, nullable: true })
  sizeGrade: string | null;

  /** Ví dụ: "1 × 40′ FCL / 20 MT". */
  @Column({ type: 'varchar', length: 255 })
  volume: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  packaging: string | null;

  /** Quốc gia & cảng đích, ví dụ "Vietnam — Cat Lai Port". */
  @Column({ type: 'varchar', length: 255 })
  destination: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  incoterm: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Index('IDX_quote_requests_status')
  @Column({ type: 'varchar', length: 20, default: QuoteRequestStatus.NEW })
  status: QuoteRequestStatus;
}
