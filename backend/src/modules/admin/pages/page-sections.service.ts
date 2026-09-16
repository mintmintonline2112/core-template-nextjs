import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PageSection } from './entities/page-section.entity';
import {
  SectionDefinition,
  SectionFieldSpec,
} from './entities/section-definition.entity';

type Meta = Record<string, unknown>;

const isObject = (value: unknown): value is Meta =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const isStringOrEmpty = (value: unknown) =>
  value === undefined || value === null || typeof value === 'string';

/**
 * Kiểm tra metadata theo spec của component (bảng section_definitions):
 * đúng kiểu từng field đã khai báo, `layout` thuộc danh sách cho phép. Key
 * ngoài spec được giữ nguyên (dữ liệu nâng cao / cũ). Trả về danh sách lỗi.
 */
export function metadataProblems(
  fields: SectionFieldSpec[],
  metadata: Meta,
  scope = '',
): string[] {
  const problems: string[] = [];
  const at = (label: string) => `${scope}${label}`;
  const layout = typeof metadata.layout === 'string' ? metadata.layout : undefined;

  for (const spec of fields) {
    // Field chỉ thuộc bố cục khác → không bắt lỗi.
    if (spec.layouts && (!layout || !spec.layouts.includes(layout))) continue;

    if (spec.type === 'textMap') {
      const target = spec.key === '__self__' ? metadata : metadata[spec.key];
      if (spec.key !== '__self__' && target !== undefined && !isObject(target)) {
        problems.push(`${at(spec.label)} phải là nhóm ô chữ`);
        continue;
      }
      for (const field of spec.fields) {
        const value = isObject(target) ? target[field.name] : undefined;
        if (!isStringOrEmpty(value)) problems.push(`${at(field.label)} phải là chữ`);
      }
      continue;
    }

    const value = metadata[spec.key];
    if (value === undefined || value === null) continue;

    switch (spec.type) {
      case 'stringList':
        if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
          problems.push(`${at(spec.label)} phải là danh sách chữ`);
        }
        break;
      case 'itemList':
        if (
          !Array.isArray(value) ||
          value.some(
            (item) =>
              typeof item !== 'string' &&
              !(isObject(item) && Object.values(item).every(isStringOrEmpty)),
          )
        ) {
          problems.push(`${at(spec.label)} phải là danh sách mục (mỗi ô là chữ)`);
        }
        break;
      case 'image':
        if (typeof value !== 'string') problems.push(`${at(spec.label)} phải là đường dẫn ảnh`);
        break;
      case 'select':
        if (typeof value !== 'string' || !spec.options.some((o) => o.value === value)) {
          problems.push(
            `${at(spec.label)} phải là một trong: ${spec.options.map((o) => o.value).join(', ')}`,
          );
        }
        break;
      case 'json':
        break;
    }
  }
  return problems;
}

@Injectable()
export class PageSectionsService extends BaseService<PageSection, number> {
  constructor(
    @InjectRepository(PageSection)
    sectionRepo: Repository<PageSection>,
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {
    super(sectionRepo);
  }

  /**
   * DB có unique (pageId, sectionKey) — để lọt xuống MySQL thì admin chỉ thấy
   * lỗi 500 "Duplicate entry". Chặn trước và nói rõ phải làm gì.
   */
  private async ensureKeyFree(
    pageId: number,
    sectionKey: string,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.repo.findOne({
      where: {
        pageId,
        sectionKey,
        ...(ignoreId != null ? { id: Not(ignoreId) } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `Trang này đã có section key "${sectionKey}" (id ${existing.id}). ` +
          'Sửa section đó, hoặc nhập Section key khác nếu muốn dùng component này lần nữa.',
      );
    }
  }

  /**
   * Metadata (và bản dịch metadata) phải khớp spec của component đang dùng.
   * Component không có trong danh mục (khối generic / tên cũ) thì bỏ qua.
   */
  private async validateMetadata(
    componentKey: string | undefined,
    metadata: unknown,
    translations: unknown,
  ): Promise<void> {
    if (metadata !== undefined && metadata !== null && !isObject(metadata)) {
      throw new BadRequestException('Metadata phải là một object.');
    }
    if (!componentKey) return;
    const definition = await this.definitionRepo.findOne({
      where: { sectionKey: componentKey },
    });
    if (!definition) return;

    const problems = isObject(metadata) ? metadataProblems(definition.fields, metadata) : [];

    if (isObject(translations)) {
      for (const [lang, bag] of Object.entries(translations)) {
        if (!isObject(bag) || bag.metadata === undefined || bag.metadata === null) continue;
        if (!isObject(bag.metadata)) {
          problems.push(`Bản dịch ${lang}: metadata phải là một object`);
          continue;
        }
        // Bản dịch không có layout riêng → kiểm tra theo layout của bản gốc.
        const layout = isObject(metadata) ? metadata.layout : undefined;
        problems.push(
          ...metadataProblems(
            definition.fields,
            { ...bag.metadata, layout },
            `Bản dịch ${lang} · `,
          ),
        );
      }
    }

    if (problems.length > 0) {
      throw new BadRequestException(`Dữ liệu khối không hợp lệ: ${problems.join('; ')}.`);
    }
  }

  private componentKeyOf(metadata: unknown, sectionKey: string | undefined) {
    const fromMeta = isObject(metadata) ? metadata._component : undefined;
    return typeof fromMeta === 'string' && fromMeta ? fromMeta : sectionKey;
  }

  async create(data: DeepPartial<PageSection>): Promise<PageSection> {
    if (data.pageId != null && data.sectionKey) {
      await this.ensureKeyFree(data.pageId, data.sectionKey);
    }
    await this.validateMetadata(
      this.componentKeyOf(data.metadata, data.sectionKey),
      data.metadata,
      data.translations,
    );
    return super.create(data);
  }

  async update(
    id: number,
    data: DeepPartial<PageSection>,
    manager?: Parameters<BaseService<PageSection, number>['update']>[2],
  ): Promise<PageSection> {
    const current = await this.repo.findOne({
      where: { id },
      select: { id: true, pageId: true, sectionKey: true, metadata: true },
    });

    if (current && (data.sectionKey || data.pageId != null)) {
      await this.ensureKeyFree(
        data.pageId ?? current.pageId,
        data.sectionKey ?? current.sectionKey,
        id,
      );
    }

    if (data.metadata !== undefined || data.translations !== undefined) {
      const metadata = data.metadata !== undefined ? data.metadata : current?.metadata;
      await this.validateMetadata(
        this.componentKeyOf(metadata, data.sectionKey ?? current?.sectionKey),
        metadata,
        data.translations,
      );
    }

    return super.update(id, data, manager);
  }
}
