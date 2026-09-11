import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { Permissions } from '../decorators/permission.decorator';

@ApiBearerAuth()
export class BaseController<
  T,
  CreateDto,
  UpdateDto,
  IdType extends string | number = string | number,
> {
  delete(id: number) {
    throw new Error('Method not implemented.');
  }

  constructor(
    protected readonly service: BaseService<T, IdType>,
    private readonly entityName: string,
  ) {}

  protected getFindAllOptions(): FindManyOptions<T> {
    return {};
  }

  protected getFindOneOptions(id: IdType): FindOneOptions<T> {
    return { where: { id } as any };
  }

  protected getSearchFields(): (keyof T)[] {
    return [];
  }

  /**
   * Cột được phép lọc qua query string (?status=draft&categoryId=3).
   * Mặc định RỖNG = không cho lọc gì — controller nào cần thì override.
   * Tham số ngoài danh sách bị bỏ qua im lặng (không ném lỗi).
   */
  protected getFilterableFields(): (keyof T)[] {
    return [];
  }

  protected buildSearchWhere?(search: string): any[] | null;

  @Permissions('LIST')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    example: '[{"createdAt":"DESC"},{"id":"ASC"}]',
  })
  async findAll(@Query() query: any) {
    const { page = 1, limit = 10, search, orderBy, ...filters } = query;

    let parsedOrderBy;

    try {
      parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    } catch (e) {
      throw new BadRequestException('orderBy must be valid JSON array');
    }

    const allowed = new Set(this.getFilterableFields().map(String));
    const safeFilters: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (allowed.has(key)) safeFilters[key] = value;
    }

    const options = this.getFindAllOptions();

    const customWhere =
      search && this.buildSearchWhere ? this.buildSearchWhere(search) : null;

    if (customWhere) {
      options.where = customWhere;
    }

    return await this.service.paginate(
      options,
      page,
      limit,
      customWhere ? undefined : search,
      customWhere ? [] : this.getSearchFields(),
      safeFilters,
      parsedOrderBy,
    );
  }

  @Permissions('DETAIL')
  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của bản ghi' })
  async findOne(@Param('id') id: IdType) {
    return await this.service.findOne(this.getFindOneOptions(id));
  }

  @Permissions('CREATE')
  @Post()
  async create(@Body() dto: CreateDto) {
    return await this.service.create(dto as any);
  }

  @Permissions('UPDATE')
  @Put(':id')
  async update(@Param('id') id: IdType, @Body() dto: UpdateDto) {
    return await this.service.update(id, dto as any);
  }

  @Permissions('DELETE')
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: IdType) {
    return await this.service.delete(id);
  }

  @Permissions('SORT')
  @Patch('sort/:id')
  async updateSort(
    @Param('id') id: IdType,
    @Body('sort') sort: number,
  ): Promise<T> {
    return this.service.updateSort(id, sort);
  }
}
