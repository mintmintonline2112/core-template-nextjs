import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MenuItem } from 'src/modules/admin/menu-items/menu-item.entity';

interface SeedMenuChild {
  label: string;
  href: string;
}

interface SeedMenuItem {
  label: string;
  href: string;
  description?: string;
  showSubmenu?: boolean;
  children?: SeedMenuChild[];
}

/** Điều hướng chính của website Prime Nuts USA — khớp header trong frontend/. */
const MENU_TREE: SeedMenuItem[] = [
  {
    label: 'Home',
    href: '/',
    showSubmenu: false,
  },
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'Natural Almonds', href: '/products#natural' },
      { label: 'Processed Almonds', href: '/products#processed' },
      { label: 'Kernel Sizes', href: '/products#sizes' },
    ],
  },
  {
    label: 'Markets',
    href: '/#markets',
    showSubmenu: false,
  },
  {
    label: 'Sourcing',
    href: '/#sourcing',
    showSubmenu: false,
  },
  {
    label: 'News',
    href: '/news',
    children: [
      { label: 'Market Update', href: '/news?category=market-update' },
      { label: 'Company News', href: '/news?category=company-news' },
      { label: 'Industry Insight', href: '/news?category=industry-insight' },
      { label: 'Logistics', href: '/news?category=logistics' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
    showSubmenu: false,
  },
];

/**
 * Insert-only theo href: mục đã tồn tại (kể cả admin đã sửa/ẩn) giữ nguyên,
 * chỉ tạo mục còn thiếu — chạy lại db:seed trên production an toàn.
 */
@Injectable()
export class MenuSeed {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
  ) {}

  async run(): Promise<void> {
    let created = 0;
    let rootOrder = 0;

    for (const item of MENU_TREE) {
      rootOrder++;
      let root = await this.menuRepo.findOne({
        where: { href: item.href, parentId: IsNull() },
        withDeleted: true,
      });

      if (!root) {
        root = await this.menuRepo.save(
          this.menuRepo.create({
            label: item.label,
            href: item.href,
            description: item.description ?? null,
            parentId: null,
            isActive: true,
            showSubmenu: item.showSubmenu ?? true,
            sortOrder: rootOrder,
          }),
        );
        created++;
      }

      let childOrder = 0;
      for (const child of item.children ?? []) {
        childOrder++;
        const existing = await this.menuRepo.findOne({
          where: { href: child.href, parentId: root.id },
          withDeleted: true,
        });
        if (existing) continue;

        await this.menuRepo.save(
          this.menuRepo.create({
            label: child.label,
            href: child.href,
            parentId: root.id,
            isActive: true,
            sortOrder: childOrder,
          }),
        );
        created++;
      }
    }

    console.log(
      created > 0
        ? `Menu seed: created ${created} missing item(s).`
        : 'Menu seed: nothing missing, skipping.',
    );
  }
}
