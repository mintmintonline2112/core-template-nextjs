import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { MenuItem } from './menu-item.entity';

@Injectable()
export class MenuItemsService extends BaseService<MenuItem, number> {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
  ) {
    super(menuRepo);
  }

  /** Cây menu public; `lang` → merge translations (nhãn) trên cả gốc lẫn con. */
  async findPublicTree(lang: Lang = 'vi'): Promise<MenuItem[]> {
    const rows = await this.menuRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const items = rows.map((item) => applyTranslations(item, lang));

    const roots = items.filter((item) => item.parentId == null);
    return roots.map((root) => ({
      ...root,
      children: items.filter((item) => item.parentId === root.id),
    }));
  }
}
