import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';

export type PageDefinition = {
  page: DeepPartial<Page> & { slug: string };
  sections: Array<DeepPartial<PageSection> & { sectionKey: string }>;
};

/* ---------- Nội dung dùng lại giữa các section ---------- */

const ABOUT_INTRO =
  '<p>Prime Nuts USA is a California-based sourcing and trading company focused on connecting qualified international buyers with the California almond supply chain.</p>' +
  '<p>We simplify procurement by providing buyers with a local sourcing partner who understands supplier communication, product specifications, commercial requirements, logistics, and international trade.</p>';

const VARIETIES_INTRO =
  '<p>California is the center of the global almond industry, supported by an extensive network of experienced growers, handlers, processors, and exporters.</p>' +
  '<p>Prime Nuts USA helps wholesale buyers source California almonds according to their specific commercial requirements, including variety, grade, size, crop year, packaging, order volume, destination, and preferred shipping schedule.</p>';

const KERNEL_SIZES = ['20/22', '22/24', '23/25', '25/27', '27/30', '30/32'];

const PROCESS_STEPS = [
  { title: 'Send Your Requirements', text: 'Provide the variety, size, grade, quantity, packaging, destination port, preferred shipment date, and Incoterm.' },
  { title: 'We Source in California', text: 'Our team reviews available supply and identifies options that match your product and commercial requirements.' },
  { title: 'Review the Offer', text: 'You receive the applicable product specifications, pricing, packing details, commercial terms, and estimated availability.' },
  { title: 'Confirm the Order', text: 'Once the terms are agreed upon, we coordinate the order, documentation, and required arrangements with the appropriate suppliers and logistics partners.' },
  { title: 'Coordinate Shipment', text: 'Prime Nuts USA follows the order through export preparation, container coordination, and cargo dispatch.' },
];

/**
 * NỘI DUNG MẶC ĐỊNH của website Prime Nuts USA — nguồn nội dung DUY NHẤT
 * (component không có chữ mặc định; bản dự phòng của frontend sinh từ đây bằng
 * `npm run content:export`).
 *
 * Mỗi section: sectionKey = id neo trên trang (giữ ổn định vì menu trỏ vào),
 * metadata._component = component trong registry frontend, metadata.layout = bố cục.
 * Insert-only theo slug/sectionKey: trang đã tồn tại (kể cả admin đã sửa) giữ
 * nguyên, chỉ bổ sung key metadata còn thiếu; chạy lại db:seed an toàn.
 */
export const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Home',
      slug: 'home',
      eyebrow: 'California Almond Sourcing',
      lead: 'Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaTitle: 'Prime Nuts USA — California Almonds. Sourced with Confidence.',
      metaDescription:
        'Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.',
    },
    sections: [
      {
        sectionKey: 'hero-slider',
        heading: 'California Almonds. Sourced with Confidence.',
        subheading: 'California Almond Sourcing',
        content:
          '<p>Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.</p>' +
          '<p>Prime Nuts USA connects international buyers with established growers, handlers, processors, and logistics partners throughout California. Tell us your required variety, grade, size, volume, packaging, and destination&mdash;we will identify suitable supply options and coordinate the purchasing process through shipment.</p>',
        metadata: {
          _component: 'hero',
          layout: 'slider',
          // Mô tả slide: văn bản thường, xuống dòng 2 lần để tách đoạn.
          slides: [
            {
              image: '/images/orchard-rows.jpg',
              title: 'California Almonds. Sourced with Confidence.',
              text: 'Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.\n\nPrime Nuts USA connects international buyers with established growers, handlers, processors, and logistics partners throughout California. Tell us your required variety, grade, size, volume, packaging, and destination—we will identify suitable supply options and coordinate the purchasing process through shipment.',
              alt: 'California almond orchard',
            },
            {
              image: '/images/hero-branch.jpg',
              title: 'Sourced from California. Supplied to Your Requirements.',
              text: 'California is the center of the global almond industry, supported by an extensive network of experienced growers, handlers, processors, and exporters.',
              alt: 'Almonds ripening on the branch',
            },
            {
              image: '/images/container-ship.jpg',
              title: 'A Local Point of Contact for Your Almond Purchases',
              text: 'You send us your purchasing requirements, and our team identifies suitable supply options, coordinates commercial details, and follows the order through export preparation and cargo dispatch.',
              alt: 'Container ship at a port terminal',
            },
          ],
          stats: [
            { label: 'California Varieties', value: '4+' },
            { label: 'Kernel Sizes', value: '6' },
            { label: 'Steps to Shipment', value: '5' },
          ],
          image: '/images/orchard-rows.jpg',
          ctaLabel: 'Request a Quote',
          ctaHref: '#request-quote',
          cta2Label: 'Send Your Specifications',
          cta2Href: '#product-specs',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'about-map',
        heading: 'Connecting California Supply with Global Demand',
        subheading: 'About Prime Nuts USA',
        content: ABOUT_INTRO,
        metadata: {
          _component: 'about-map',
          layout: 'regions',
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
            { key: 'sa', name: 'South Asia', countries: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka'] },
            {
              key: 'me',
              name: 'Middle East',
              countries: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan'],
            },
            {
              key: 'eu',
              name: 'Europe',
              countries: ['Germany', 'Netherlands', 'Spain', 'Italy', 'France', 'United Kingdom'],
            },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'almond-variety-cards',
        heading: 'Sourced from California. Supplied to Your Requirements.',
        subheading: 'California Almonds',
        content: VARIETIES_INTRO,
        metadata: {
          _component: 'media-cards',
          layout: 'toggle',
          items: [
            { title: 'Nonpareil', short: 'Light color, smooth surface and an attractive appearance.', text: 'Known for its light color, smooth surface, attractive appearance, and broad range of commercial applications.', image: '' },
            { title: 'Independence', short: 'A widely available California variety.', text: 'A widely available California variety suitable for wholesale, roasting, processing, and ingredient applications.', image: '/images/almonds-table.webp' },
            { title: 'Carmel-Type Almonds', short: 'Versatile almonds for processing and roasting.', text: 'Versatile almonds commonly selected for processing, roasting, and food manufacturing.', image: '/images/green-almond.jpg' },
            { title: 'California-Type Almonds', short: 'Commercial varieties in multiple sizes and specifications.', text: 'Commercial varieties available in multiple sizes and specifications, depending on the crop and current market availability.', image: '' },
          ],
          sizes: KERNEL_SIZES,
          ctaLabel: 'Check Current Availability',
          ctaHref: '#request-quote',
          note: 'Additional varieties and custom specifications may be sourced upon request.',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'product-specs',
        heading: 'Almonds Matched to Your Market',
        subheading: 'Product Specifications',
        content:
          '<p>Every buyer and destination market has different requirements. We source almonds according to the specifications provided with each inquiry.</p>' +
          '<p>Other sizes, private specifications, and custom packing requirements may be discussed for qualified volume orders.</p>',
        metadata: {
          _component: 'icon-card-list',
          layout: 'split',
          items: [
            { title: 'Product', text: 'Natural California Almond Kernels', icon: 'product' },
            { title: 'Origin', text: 'California, USA', icon: 'pin' },
            { title: 'Varieties', text: 'Nonpareil, Independence, Carmel-Type, California-Type, and other available varieties', icon: 'leaf' },
            { title: 'Sizes', text: KERNEL_SIZES.join(', '), icon: 'ruler' },
            { title: 'Grades', text: 'USDA grades and commercial specifications available upon request', icon: 'grade' },
            { title: 'Crop', text: 'Current crop and other available crop positions', icon: 'calendar' },
            { title: 'Packaging', text: '50 lb cartons or other commercial packaging upon request', icon: 'box' },
            { title: 'Volume', text: 'Pallet, truckload, and container quantities, subject to availability', icon: 'pallet' },
          ],
          ctaLabel: 'Send Your Specifications',
          ctaHref: '#request-quote',
          image: '/images/bulk-warehouse.jpg',
          imageAlt: 'Palletized cartons stored in a commercial warehouse',
          image2: '/images/ship-color.webp',
          image2Alt: 'Container ship being loaded at a port terminal',
          badge: '50 lb|Cartons',
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'how-it-works',
        heading: 'From Requirements to Shipment',
        subheading: 'Working Process',
        metadata: {
          _component: 'steps',
          layout: 'circles',
          items: PROCESS_STEPS,
          // Dùng khi đổi sang bố cục "Slider + ô bước".
          slides: [
            { image: '/images/almonds-ramekin.webp', caption: 'Tell us your variety, size, grade & volume' },
            { image: '/images/orchard-rows.jpg', caption: 'Sourced from established California suppliers' },
            { image: '/images/kernels-study.jpg', caption: 'Specifications, pricing & availability' },
            { image: '/images/green-almond.jpg', caption: 'Order, documentation & arrangements' },
            { image: '/images/ship-color.webp', caption: 'Export preparation & cargo dispatch' },
          ],
          ctaLabel: 'Start a Sourcing Request',
          ctaHref: '#request-quote',
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'sourcing-services',
        heading: 'A Local Point of Contact for Your Almond Purchases',
        subheading: 'California-Based Sourcing & Procurement',
        content:
          '<p>Working with suppliers from overseas can involve multiple parties, delayed communication, and unclear product availability.</p>' +
          '<p>Prime Nuts USA provides international buyers with a California-based sourcing contact. You send us your purchasing requirements, and our team identifies suitable supply options, coordinates commercial details, and follows the order through export preparation and cargo dispatch.</p>',
        metadata: {
          _component: 'feature-list',
          layout: 'split',
          items: [
            { label: 'Supplier sourcing and quotation' }, { label: 'Product and specification matching' },
            { label: 'Commercial negotiation support' }, { label: 'Procurement coordination' },
            { label: 'Packing and documentation coordination' }, { label: 'Export preparation' },
            { label: 'Freight and container coordination' }, { label: 'Shipment follow-up' },
          ],
          chips: [],
          image: '/images/container-ship.jpg',
          note: 'Our objective is simple: to make purchasing California almonds more efficient, transparent, and reliable for international buyers.',
        },
        sortOrder: 6,
      },
      {
        sectionKey: 'buyers-marquee',
        heading: 'International Buyers',
        content:
          '<p>We welcome inquiries for recurring supply programs as well as spot purchases based on current California market availability.</p>',
        metadata: {
          _component: 'marquee',
          items: [
            'Importers', 'Distributors', 'Wholesalers', 'Food Manufacturers',
            'Nut Processors & Roasters', 'Retail & Private-Label Operators',
            'Food-Service Suppliers',
          ],
        },
        sortOrder: 7,
      },
      {
        sectionKey: 'faq',
        heading: 'Why Prime Nuts USA?',
        subheading: 'Why Choose Us',
        metadata: {
          _component: 'faq',
          layout: 'columns',
          headingAccent: 'Prime Nuts USA?',
          items: [
            { question: 'California-Based Sourcing', answer: 'Our location in California allows us to communicate efficiently with suppliers, processors, and logistics partners operating within the almond supply chain.' },
            { question: 'Multiple Supply Options', answer: 'We are not limited to a single variety or supply source. This allows us to evaluate different options according to each buyer’s specifications, volume, destination, and commercial requirements.' },
            { question: 'Buyer-Focused Procurement', answer: 'We begin with your requirements and source accordingly. Our goal is to find supply that fits your market—not to push a predetermined product.' },
            { question: 'Export Coordination', answer: 'We assist with the commercial, documentation, and logistics coordination needed to move California almonds to international destinations.' },
            { question: 'Long-Term Supply Relationships', answer: 'Our focus extends beyond individual transactions. We aim to build dependable sourcing relationships with qualified buyers who require consistent access to California almond supply.' },
          ],
        },
        sortOrder: 8,
      },
      {
        sectionKey: 'request-quote',
        heading: 'Looking for California Almonds?',
        subheading: 'Request a Quote',
        content:
          '<p>Send us your purchasing requirements, and our California sourcing team will review the available supply options.</p><p>Please include:</p>',
        metadata: {
          _component: 'quote-form',
          items: [
            'Product or variety', 'Grade', 'Size', 'Quantity', 'Packaging',
            'Destination country', 'Destination port', 'Target shipment date',
            'Incoterm preference', 'Special specifications, if applicable',
          ],
          note: 'Prime Nuts USA · California, USA — Wholesale and trade inquiries only.',
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
          _component: 'media-cards',
          layout: 'photo',
          image: '/images/almonds-ramekin.webp',
          imageAlt: 'Raw natural almond kernels in a white ramekin on a wooden board',
          itemLabel: 'Variety',
          items: [
            { title: 'Nonpareil', text: 'The flagship California variety — light color and a smooth, attractive kernel, the benchmark for premium snacking and retail programs.', image: '/images/products/nonpareil.jpg', imagePosition: 'center 64%' },
            { title: 'Independence', text: 'A widely planted modern variety with an appealing, versatile kernel — a dependable option for snacking and blanching alike.', image: '/images/products/independence.jpg', imagePosition: '64% 64%' },
            { title: 'Monterey', text: 'A larger, elongated kernel and a dependable workhorse for industrial, ingredient, and manufacturing use.', image: '/images/products/monterey.jpg', imagePosition: 'center' },
            { title: 'Carmel', text: 'A versatile kernel well suited to roasting, blanching, and a broad range of food-manufacturing applications.', image: '/images/products/carmel.jpg', imagePosition: 'center 68%' },
            { title: 'Butte', text: 'A smaller, rounded Mission-type kernel — popular for snack mixes, roasting, and export markets where compact sizes are preferred.', image: '/images/products/butte.jpg', imagePosition: 'center' },
            { title: 'Padre', text: 'A hardy Mission-type variety with a plump kernel and rich flavor — well suited to roasting, dicing, and processed applications.', image: '/images/products/padre.jpg', imagePosition: '55% center' },
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
          _component: 'media-cards',
          layout: 'badge',
          itemLabel: 'Format',
          items: [
            { title: 'Blanched', text: 'Whole kernels with skins removed — clean, ivory color for marzipan, confectionery, and premium bakery use.', image: '/images/products/blanched.jpg', icon: 'blanched' },
            { title: 'Sliced', text: 'Thin, uniform slices — natural or blanched — for bakery toppings, cereals, salads, and garnishes.', image: '/images/products/sliced.jpg', icon: 'sliced' },
            { title: 'Slivered', text: 'Julienne-cut blanched kernels — a classic format for baking, rice dishes, pilafs, and garnish.', image: '/images/products/slivered.jpg', imagePosition: 'center 5%', icon: 'slivered' },
            { title: 'Diced', text: 'Uniform pieces in a range of cut sizes — ideal for chocolate and candy inclusions, ice cream, and granola.', image: '/images/products/diced.jpg', icon: 'diced' },
            { title: 'Almond Flour & Meal', text: 'Finely ground blanched flour and natural meal — for gluten-free baking, macarons, coatings, and ingredient blends.', image: '/images/products/almond-flour.jpg', icon: 'flour' },
          ],
          photos: [
            { image: '/images/almond-tart.webp', caption: 'Almond flour & bakery applications' },
            { image: '/images/kernels-study.jpg', caption: 'In-shell, natural & blanched kernels' },
          ],
          note: '<strong>Product selection</strong> is based on variety, grade, size, crop year, specifications, packaging, and intended application.',
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
          _component: 'size-scale',
          layout: 'section',
          items: ['18/20', '20/22', '23/25', '25/27', '27/30', '30/32', '32/34'],
          scaleNote: 'Custom sizes & grades on request',
          footnote: 'Different grades, varieties and specifications may be available depending on crop and market conditions.',
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
        // Thông tin liên hệ lấy từ Admin → Trang Liên hệ (không nhập ở đây).
        sectionKey: 'contact-details',
        heading: 'Prime Nuts USA',
        subheading: 'Get in Touch',
        content:
          '<p>We work with commercial buyers — importers, distributors, wholesalers, food manufacturers, roasters, and private-label brands.</p>',
        metadata: {
          _component: 'contact',
          layout: 'form',
          note: 'We typically respond to commercial inquiries within 1–2 business days. For the fastest quotation, include your target variety, size &amp; grade, volume, packaging, destination port, and preferred Incoterm.',
          image: '/images/orchard-rows.jpg',
          imageAlt: 'Rows of almond trees in a California orchard',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'quote-checklist',
        heading: 'Tell Us What You Need',
        subheading: 'Faster Quotations',
        content:
          '<p>The more detail you share, the faster we can prepare a commercial quotation based on current availability and market conditions.</p>',
        metadata: {
          _component: 'checklist',
          items: [
            'Almond Variety', 'Size & Grade', 'Required Volume', 'Packaging',
            'Destination Country & Port', 'Preferred Incoterm',
            'Target Shipment Window', 'Certifications Required',
          ],
          note: 'Prefer a structured form? Use the detailed <a href="/#request-quote">B2B quote request form</a> on our home page.',
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
