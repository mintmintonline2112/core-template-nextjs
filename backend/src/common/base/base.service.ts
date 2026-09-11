import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import ExcelJS from 'exceljs';

/**
 * Per-field export config.
 * - `true`  → include, auto-format key as column header
 * - `string` → include, use the string as column header
 * - `false` / omitted → exclude
 */
export type ExportFieldConfig<E extends object> = {
  [K in keyof E]?: boolean | string;
};

export class BaseService<
  T extends { id?: IdType; deletedAt?: Date | null },
  IdType extends string | number = string | number,
> {
  constructor(protected readonly repo: Repository<T>) {}

  async updateSort(id: IdType, sort: unknown): Promise<T> {
    const parsed = Number(sort);

    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('Sort must be an integer');
    }

    if (parsed < 1) {
      throw new BadRequestException('Sort must be greater than or equal to 1');
    }

    const entity = await this.repo.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    if (!('sort' in entity) && !('sortOrder' in entity)) {
      throw new BadRequestException('Entity does not support sort field');
    }

    if ('sortOrder' in entity) {
      (entity as any).sortOrder = parsed;
    } else {
      (entity as any).sort = parsed;
    }

    return await this.repo.save(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async createMany(
    data: DeepPartial<T>[],
    manager?: EntityManager,
  ): Promise<T[]> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    const repo = manager
      ? manager.getRepository<T>(this.repo.target)
      : this.repo;

    const entities = repo.create(data);

    if (manager) {
      return await repo.save(entities);
    }

    return await this.repo.manager.transaction(async (trx) => {
      const txRepo = trx.getRepository<T>(this.repo.target);
      return await txRepo.save(entities);
    });
  }

  async update(
    id: IdType,
    data: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repo.target)
      : this.repo;

    const entity = await repo.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    const updatedEntity = repo.merge(entity, data);

    if (manager) {
      return await repo.save(updatedEntity);
    }

    return await this.repo.manager.transaction(async (trx) => {
      const txRepo = trx.getRepository<T>(this.repo.target);
      return await txRepo.save(updatedEntity);
    });
  }

  async delete(id: IdType): Promise<any> {
    const whereCondition = { id } as FindOptionsWhere<T>;

    const entity = await this.repo.findOne({
      where: whereCondition,
      withDeleted: true,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    if ('deletedAt' in entity) {
      await this.repo.update(id, {
        deletedAt: new Date(),
      } as unknown as import('typeorm').QueryDeepPartialEntity<T>);
      return { id, softDeleted: true };
    } else {
      await this.repo.delete(id);
      return { id, hardDeleted: true };
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repo.findOne(options);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(options);
  }

  async paginate(
    options: FindManyOptions<T> = {},
    page = 1,
    limit = 10,
    search?: string,
    searchFields: (keyof T)[] = [],
    filters: Record<string, any> = {},
    orderBy?: Partial<Record<keyof T, 'ASC' | 'DESC' | 'asc' | 'desc'>>[],
  ): Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    let whereConditions: FindOptionsWhere<T>[] = [];

    const filterCondition = this.applyFilters(filters);
    const searchConditions = this.applySearch(search, searchFields);

    const baseConditions = options.where
      ? Array.isArray(options.where)
        ? options.where
        : [options.where]
      : [{}];

    // Thứ tự gộp: filter (client gửi) → search → điều kiện gốc của service.
    // Trải sau thì thắng, nên baseCondition LUÔN đè filter: `?status=draft`
    // không thể lật điều kiện `status = PUBLISHED` của danh sách bài viết public.
    whereConditions = baseConditions.flatMap((baseCondition) => {
      if (!searchConditions) {
        return [{ ...filterCondition, ...baseCondition }];
      }

      return searchConditions.map((searchCondition) => ({
        ...filterCondition,
        ...searchCondition,
        ...baseCondition,
      }));
    });

    options.where = whereConditions;

    const order: any = {};

    if (orderBy && orderBy.length > 0) {
      const sortable = this.columnNames();
      for (const item of orderBy) {
        if (!item || typeof item !== 'object') {
          throw new BadRequestException('orderBy must be an array of objects');
        }
        for (const key in item) {
          if (!sortable.has(key)) {
            throw new BadRequestException(`Cannot sort by unknown column "${key}"`);
          }
          const direction = String(item[key]).toUpperCase();
          if (direction !== 'ASC' && direction !== 'DESC') {
            throw new BadRequestException(
              `Sort direction for "${key}" must be ASC or DESC`,
            );
          }
          order[key] = direction;
        }
      }
    } else {
      order['createdAt'] = 'DESC';
    }

    const [data, total] = await this.repo.findAndCount({
      ...options,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Tên các cột thật của entity — dùng để lọc tham số rác trước khi đưa cho TypeORM. */
  protected columnNames(): Set<string> {
    return new Set(this.repo.metadata.columns.map((c) => c.propertyName));
  }

  protected applyFilters(filters: Record<string, any>): FindOptionsWhere<T> {
    const condition: any = {};
    const columns = this.columnNames();

    Object.keys(filters).forEach((key) => {
      // Tham số lạ (?foo=1) trước đây được đẩy thẳng vào TypeORM và ném
      // EntityPropertyNotFoundError → 500. Giờ bỏ qua im lặng.
      if (!columns.has(key)) return;
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        condition[key] = value;
      }
    });

    return condition as FindOptionsWhere<T>;
  }

  protected applySearch(
    search?: string,
    searchFields: (keyof T)[] = [],
  ): FindOptionsWhere<T>[] | null {
    if (!search || searchFields.length === 0) return null;

    return searchFields.map(
      (field) =>
        ({
          [field]: ILike(`%${search}%`),
        }) as FindOptionsWhere<T>,
    );
  }

  async exportToExcel<E extends object>(
    data: E[],
    fields: ExportFieldConfig<E>,
    sheetName = 'Export',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    const columns = Object.entries(fields)
      .filter(([, v]) => v !== false && v != null)
      .map(([key, v]) => ({
        key,
        header: typeof v === 'string' ? v : this.formatExcelHeader(key),
      }));

    sheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: 22,
    }));
    sheet.getRow(1).font = { bold: true };

    for (const row of data) {
      const cells: Record<string, any> = {};
      for (const col of columns) {
        const val = (row as any)[col.key];
        cells[col.key] = val == null ? '' : val;
      }
      sheet.addRow(cells);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private formatExcelHeader(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
