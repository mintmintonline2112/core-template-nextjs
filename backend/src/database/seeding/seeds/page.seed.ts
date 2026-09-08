import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';

type PageDefinition = {
  page: DeepPartial<Page> & { slug: string };
  sections: Array<DeepPartial<PageSection> & { sectionKey: string }>;
};

/**
 * Nội dung mặc định của website Prime Nuts USA — khớp các trang tĩnh trong
 * frontend/ (index, products, news, contact). Insert-only theo slug/sectionKey:
 * trang đã tồn tại (kể cả admin đã sửa) giữ nguyên, chạy lại db:seed an toàn.
 */
const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Home',
      slug: 'home',
      eyebrow: 'California Almonds to the World',
      lead: 'Reliable California almond supply for U.S. & global markets.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaTitle: 'Prime Nuts USA — California Almonds to the World',
      metaDescription:
        'Prime Nuts USA connects California almond supply with importers, distributors, wholesalers, food manufacturers, roasters and retailers in the U.S. and global markets.',
    },
    sections: [
      {
        sectionKey: 'hero',
        heading: 'Reliable California Almond Supply for U.S. & Global Markets',
        subheading: 'California Almonds to the World',
        content:
          '<p>Prime Nuts USA connects California almond supply with commercial buyers in the U.S. and worldwide &mdash; reliable supply, consistent quality, competitive B2B pricing.</p>',
        metadata: {
          stats: [
            { label: 'Export Markets', value: '30+' },
            { label: 'Kernel Sizes', value: '7' },
            { label: 'FCL Containers', value: '20′ & 40′' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'markets',
        heading: 'From California to Global Markets',
        subheading: 'Global Distribution',
        content:
          '<p>California sits at the center of the global almond industry &mdash; we give B2B buyers direct access to it, at home and abroad.</p>',
        metadata: {
          regions: [
            { key: 'us', name: 'United States', countries: ['United States'] },
            { key: 'na', name: 'North America', countries: ['Canada', 'Mexico'] },
            {
              key: 'ap',
              name: 'Asia Pacific',
              countries: [
                'Vietnam', 'China', 'Hong Kong', 'Japan', 'South Korea',
                'Taiwan', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
                'Philippines',
              ],
            },
            {
              key: 'sa',
              name: 'South Asia',
              countries: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka'],
            },
            {
              key: 'me',
              name: 'Middle East',
              countries: [
                'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait',
                'Bahrain', 'Oman', 'Jordan',
              ],
            },
            {
              key: 'eu',
              name: 'Europe',
              countries: [
                'Germany', 'Netherlands', 'Spain', 'Italy', 'France',
                'United Kingdom',
              ],
            },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'products-overview',
        heading: 'Almonds for Wholesale, Distribution & Food Manufacturing',
        subheading: 'Our California Almonds',
        content:
          '<p>Natural almond kernels in the varieties, sizes, and grades your market requires.</p>',
        metadata: {
          varieties: ['Nonpareil', 'Carmel', 'Monterey', 'California Varieties'],
          sizes: ['18/20', '20/22', '23/25', '25/27', '27/30', '30/32', '32/34'],
          photos: [
            { image: '/images/kernels-study.jpg', caption: 'In-shell, natural & blanched kernels' },
            { image: '/images/almonds-ramekin.webp', caption: 'Ready for snacking & retail' },
            { image: '/images/hero-branch.jpg', caption: 'Fresh crop on the tree' },
          ],
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'orders',
        heading: 'Built for B2B Supply',
        subheading: 'Bulk & Container Orders',
        content:
          '<p>From domestic wholesale volumes to international container shipments.</p>',
        metadata: {
          configurations: [
            { title: 'Full Container Load — FCL', text: '20′ & 40′ ocean containers.' },
            { title: '50 lb Cartons', text: 'The industry-standard export carton.' },
            { title: 'Palletized Shipments', text: 'Stretch-wrapped, export-ready.' },
            { title: 'Bulk Packaging', text: 'Totes & bins for manufacturing lines.' },
            { title: 'Custom Commercial Packaging', text: 'Tailored on request.' },
          ],
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'sourcing',
        heading: "Access to California's Almond Supply Network",
        subheading: 'California Sourcing',
        content:
          '<p>Our California location plugs us straight into the world&rsquo;s most established almond supply chain.</p>',
        metadata: {
          chain: [
            'Growers', 'Hullers & Shellers', 'Processors', 'Packers',
            'Prime Nuts USA', 'Buyers & Distributors',
          ],
          // Ảnh /images/... là ảnh tĩnh của frontend; ảnh upload từ Thư viện dùng /uploads/...
          slides: [
            { image: '/images/orchard-rows.jpg', caption: 'Established California orchards' },
            { image: '/images/hero-branch.jpg', caption: 'New crop ripening on the tree' },
            { image: '/images/green-almond.jpg', caption: 'Checked by hand in the field' },
            { image: '/images/kernels-study.jpg', caption: 'Sized, sorted & graded' },
            { image: '/images/ship-color.webp', caption: 'Export-ready for global markets' },
          ],
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'logistics',
        heading: 'More Than Almond Supply',
        subheading: 'Export & Logistics Support',
        content:
          '<p>Depending on the transaction and destination, we coordinate or support:</p>',
        metadata: {
          incoterms: ['FOB', 'CFR', 'CIF'],
          documents: [
            'Commercial Invoice', 'Packing List', 'Certificate of Origin',
            'Phytosanitary Certificate', 'Bill of Lading', 'Product Specifications',
            'Food Safety Documentation',
            { label: 'Laboratory Testing Documentation', note: 'when applicable' },
          ],
        },
        sortOrder: 6,
      },
      {
        sectionKey: 'who-we-serve',
        heading: 'Who We Serve',
        metadata: {
          audiences: [
            'Importers', 'Distributors', 'Wholesalers', 'Food Manufacturers',
            'Roasters', 'Retail Suppliers', 'Private-Label Brands',
            'Food-Service Companies',
          ],
        },
        content:
          '<p>Established buyers and new-market developers alike are welcome.</p>',
        sortOrder: 7,
      },
      {
        sectionKey: 'why-us',
        heading: 'A Partner Built Around Commercial Buyers',
        subheading: 'Why Prime Nuts USA?',
        metadata: {
          reasons: [
            { title: 'California Based', text: "At the source of the world's leading almond industry." },
            { title: 'Reliable Sourcing', text: 'Established growers, handlers, processors, and packers.' },
            { title: 'B2B Focus', text: 'Built for commercial buyers and wholesale volumes.' },
            { title: 'Flexible Specifications', text: 'Varieties, sizes, grades, and packaging to your spec.' },
            { title: 'Global Trade Support', text: 'We move California almonds into international markets.' },
            { title: 'Long-Term Partnerships', text: 'Consistency, transparency, and reliable execution.' },
          ],
        },
        sortOrder: 8,
      },
      {
        sectionKey: 'quote-cta',
        heading: "Let's Grow Together",
        subheading: 'Become a Prime Nuts Distribution Partner',
        content:
          '<p>Importers, distributors, wholesalers, food manufacturers &mdash; tell us what you need:</p>',
        metadata: {
          checklist: [
            'Almond variety', 'Size & grade', 'Required volume', 'Packaging',
            'Destination country & port', 'Preferred Incoterm',
          ],
        },
        sortOrder: 9,
      },
    ],
  },
  {
    page: {
      title: 'Our Products',
      slug: 'products',
      eyebrow: 'California Almonds',
      lead: 'We source California almonds based on customer requirements, applications, and market demand — from natural kernels to processed formats for food manufacturing.',
      templateKey: 'products',
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      metaTitle: 'Our Products — Prime Nuts USA | California Almonds',
      metaDescription:
        'Natural and processed California almonds — Nonpareil, Independence, Monterey, Carmel, Butte, Padre kernels plus blanched, sliced, slivered, diced almonds and almond flour.',
    },
    sections: [
      {
        sectionKey: 'natural-almonds',
        heading: 'Natural Almond Kernels',
        subheading: 'Natural Almonds',
        content:
          '<p>Whole natural kernels with skin on, sourced from California&rsquo;s leading varieties for snacking, roasting, retail, and industrial programs.</p>',
        metadata: {
          varieties: [
            'Nonpareil', 'Independence', 'Monterey', 'Carmel', 'Butte', 'Padre',
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'processed-almonds',
        heading: 'Processed Formats for Food Manufacturing',
        subheading: 'Processed Almonds',
        content:
          '<p>Value-added almond formats prepared to commercial specifications for bakery, confectionery, dairy, and ingredient applications. Product selection is based on variety, grade, size, crop year, specifications, packaging, and intended application.</p>',
        metadata: {
          formats: [
            'Blanched', 'Sliced', 'Slivered', 'Diced', 'Almond Flour & Meal',
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'kernel-sizes',
        heading: 'Common Kernel Sizes',
        subheading: 'Specifications',
        content:
          '<p>Natural almond kernels are graded by count per ounce. Different grades, varieties and specifications may be available depending on crop and market conditions.</p>',
        metadata: {
          sizes: ['18/20', '20/22', '23/25', '25/27', '27/30', '30/32', '32/34'],
        },
        sortOrder: 3,
      },
    ],
  },
  {
    page: {
      title: 'News & Insights',
      slug: 'news',
      eyebrow: 'News & Insights',
      lead: 'Crop updates, market perspectives, and company news for our buyers and distribution partners around the world.',
      templateKey: 'news',
      status: PublishStatus.PUBLISHED,
      sortOrder: 3,
      metaTitle: 'News & Insights — Prime Nuts USA',
      metaDescription:
        'News, market updates, and industry insights from Prime Nuts USA — California almond supply for U.S. and global markets.',
    },
    sections: [],
  },
  {
    page: {
      title: 'Contact',
      slug: 'contact',
      eyebrow: 'Contact Us',
      lead: 'Whether you are an established importer or developing a new market for California almonds, our team is ready to review your requirements and respond with current availability.',
      templateKey: 'contact',
      status: PublishStatus.PUBLISHED,
      sortOrder: 4,
      metaTitle: 'Contact — Prime Nuts USA | California Almonds',
      metaDescription:
        'Contact Prime Nuts USA for California almond supply — B2B inquiries, quotations, and distribution partnerships for U.S. and global markets.',
    },
    sections: [
      {
        sectionKey: 'contact-info',
        heading: 'Prime Nuts USA',
        subheading: 'Get in Touch',
        content:
          '<p>We work with commercial buyers — importers, distributors, wholesalers, food manufacturers, roasters, and private-label brands. We typically respond to commercial inquiries within 1–2 business days.</p>',
        metadata: {
          location: 'California, United States',
          email: 'info@primenutsusa.com',
          phone: '+1 (209) 000-0000',
          businessHours: 'Monday – Friday · 8:00 AM – 5:00 PM (Pacific Time)',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'quotation-checklist',
        heading: 'Tell Us What You Need',
        subheading: 'Faster Quotations',
        content:
          '<p>The more detail you share, the faster we can prepare a commercial quotation based on current availability and market conditions.</p>',
        metadata: {
          checklist: [
            'Almond Variety', 'Size & Grade', 'Required Volume', 'Packaging',
            'Destination Country & Port', 'Preferred Incoterm',
            'Target Shipment Window', 'Certifications Required',
          ],
        },
        sortOrder: 2,
      },
    ],
  },
];

@Injectable()
export class PageSeed {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly sectionRepo: Repository<PageSection>,
  ) {}

  async run(): Promise<void> {
    let createdPages = 0;
    let createdSections = 0;
    let mergedSections = 0;

    for (const definition of PAGES) {
      let page = await this.pageRepo.findOne({
        where: { slug: definition.page.slug },
        withDeleted: true,
      });

      if (!page) {
        page = await this.pageRepo.save(this.pageRepo.create(definition.page));
        createdPages++;
      }

      for (const section of definition.sections) {
        const existing = await this.sectionRepo.findOne({
          where: { pageId: page.id, sectionKey: section.sectionKey },
          withDeleted: true,
        });

        if (existing) {
          // Bổ sung key metadata mới của seed vào section cũ — KHÔNG đè
          // key đã có (giữ chỉnh sửa của admin), chạy lại db:seed an toàn.
          const seedMeta = (section.metadata ?? {}) as Record<string, unknown>;
          const currentMeta = (existing.metadata ?? {}) as Record<string, unknown>;
          const missing = Object.keys(seedMeta).filter(
            (key) => !(key in currentMeta),
          );
          if (missing.length > 0) {
            existing.metadata = {
              ...currentMeta,
              ...Object.fromEntries(missing.map((key) => [key, seedMeta[key]])),
            };
            await this.sectionRepo.save(existing);
            mergedSections++;
          }
          continue;
        }

        await this.sectionRepo.save(
          this.sectionRepo.create({ ...section, pageId: page.id }),
        );
        createdSections++;
      }
    }

    console.log(
      createdPages + createdSections + mergedSections > 0
        ? `--- [Seed] Pages: created ${createdPages} page(s), ${createdSections} section(s); merged metadata into ${mergedSections} section(s).`
        : '--- [Seed] Pages: nothing missing, skipping.',
    );
  }
}
