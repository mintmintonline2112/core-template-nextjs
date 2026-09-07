import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

/**
 * Nội dung News & Insights của Prime Nuts USA — khớp 7 bài demo trên
 * frontend/news.html. Insert-only theo slug: chạy lại db:seed an toàn.
 */
@Injectable()
export class BlogSeed {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
  ) {}

  async run(): Promise<void> {
    const categories = [
      {
        name: 'Market Update',
        slug: 'market-update',
        description: 'Crop reports, pricing signals and shipment data',
        sortOrder: 1,
      },
      {
        name: 'Company News',
        slug: 'company-news',
        description: 'Announcements and updates from Prime Nuts USA',
        sortOrder: 2,
      },
      {
        name: 'Industry Insight',
        slug: 'industry-insight',
        description: 'Practical guides for almond buyers and manufacturers',
        sortOrder: 3,
      },
      {
        name: 'Logistics',
        slug: 'logistics',
        description: 'Shipping, documentation and trade-term guidance',
        sortOrder: 4,
      },
    ];

    for (const category of categories) {
      const existing = await this.categoryRepo.findOneBy({
        slug: category.slug,
      });
      if (existing) continue;
      await this.categoryRepo.save(this.categoryRepo.create(category));
    }

    const savedCategories = await this.categoryRepo.find();
    const categoryId = new Map(
      savedCategories.map((item) => [item.slug, item.id]),
    );

    const posts: Partial<BlogPost>[] = [
      {
        title:
          '2026 California Almond Crop: What Buyers Should Watch This Season',
        slug: '2026-california-almond-crop-what-buyers-should-watch',
        categoryId: categoryId.get('market-update'),
        excerpt:
          'Orchard conditions across the Central Valley, early size and quality expectations by variety, and what shifting carry-in levels could mean for pricing and shipment planning into Q4.',
        content:
          '<p>As the new crop year begins, orchard conditions across the Central Valley point to a healthy harvest. Early field checks suggest solid kernel development in Nonpareil and Independence blocks, with hull split arriving on a typical August schedule.</p>' +
          '<p>Buyers should watch three variables this season: early size and quality expectations by variety, carry-in inventory levels, and the pace of early-season export commitments. Together they will shape pricing and shipment planning into Q4.</p>' +
          '<p>Our advice for importers: lock in specifications early for premium sizes, and keep flexibility on grade for manufacturing programs where the market may offer value later in the season.</p>',
        coverImagePath: '/uploads/blog-posts/blossom-sky.jpg',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-15T08:00:00Z'),
        sortOrder: 1,
      },
      {
        title: 'Prime Nuts USA Expands Distribution Support for Southeast Asia',
        slug: 'prime-nuts-expands-distribution-support-southeast-asia',
        categoryId: categoryId.get('company-news'),
        excerpt:
          'We are deepening our logistics coordination for buyers in Vietnam, Thailand, and the Philippines, with improved documentation turnaround and consolidated shipment options.',
        content:
          '<p>Prime Nuts USA is deepening its logistics coordination for buyers in Vietnam, Thailand, and the Philippines. The expansion includes improved documentation turnaround and consolidated shipment options for buyers building mixed programs.</p>' +
          '<p>Southeast Asia is one of the fastest-growing regions for California almonds, and our goal is to make the first container as smooth as the fiftieth — from specification sheets to phytosanitary certificates and destination clearance.</p>',
        coverImagePath: '/uploads/blog-posts/ship-color.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-07-20T08:00:00Z'),
        sortOrder: 2,
      },
      {
        title:
          'Nonpareil vs. California Type: Choosing the Right Kernel for Your Application',
        slug: 'nonpareil-vs-california-type-choosing-the-right-kernel',
        categoryId: categoryId.get('industry-insight'),
        excerpt:
          'A practical guide for manufacturers and importers on how variety, size, and grade affect cost, appearance, and performance in the finished product.',
        content:
          '<p>Nonpareil commands a premium for its light color and smooth, attractive kernel — the benchmark for snacking and retail programs where appearance drives purchase decisions.</p>' +
          '<p>California type is a flexible classification covering multiple interchangeable varieties. For blanching, roasting, dicing, and ingredient applications where the skin is removed or the kernel is transformed, it often delivers the same finished result at a better cost basis.</p>' +
          '<p>The right choice comes down to application: pay for appearance where the consumer sees the kernel; buy on specification where the process transforms it.</p>',
        coverImagePath: '/uploads/blog-posts/kernels-study.jpg',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-06-18T08:00:00Z'),
        sortOrder: 3,
      },
      {
        title:
          'Understanding Incoterms for Almond Imports: FOB, CFR, and CIF Compared',
        slug: 'understanding-incoterms-almond-imports-fob-cfr-cif',
        categoryId: categoryId.get('logistics'),
        excerpt:
          'What each trade term means for cost, risk, and responsibility — and how to choose the right structure for your first container from California.',
        content:
          '<p>Under <strong>FOB</strong> (Free On Board), the buyer takes over cost and risk once the container is loaded at the California port — the right choice for importers with strong freight relationships.</p>' +
          '<p><strong>CFR</strong> (Cost and Freight) adds ocean freight to the seller&rsquo;s side while risk still transfers at origin. <strong>CIF</strong> (Cost, Insurance and Freight) further adds marine insurance — the simplest structure for a first-time importer.</p>' +
          '<p>Prime Nuts USA quotes under all three terms depending on destination and transaction requirements; tell us your preference when requesting a quotation.</p>',
        coverImagePath: '/uploads/blog-posts/container-ship.jpg',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-05-12T08:00:00Z'),
        sortOrder: 4,
      },
      {
        title:
          'Almond Shipment Trends: Export Demand Holds Firm Across Asia and the Middle East',
        slug: 'almond-shipment-trends-export-demand-asia-middle-east',
        categoryId: categoryId.get('market-update'),
        excerpt:
          'A look at recent industry shipment data and what sustained demand in key import markets signals for the months ahead.',
        content:
          '<p>Recent industry shipment reports show export demand holding firm across Asia and the Middle East, with India, the UAE, and Vietnam among the standout destinations.</p>' +
          '<p>Sustained offtake in these markets typically firms the floor under kernel pricing for the months ahead — a signal for buyers to plan coverage rather than wait for dips.</p>',
        coverImagePath: '/uploads/blog-posts/orchard-aerial.jpg',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-04-10T08:00:00Z'),
        sortOrder: 5,
      },
      {
        title: 'From Bloom to Harvest: A Year in a California Almond Orchard',
        slug: 'from-bloom-to-harvest-a-year-in-california-almond-orchard',
        categoryId: categoryId.get('industry-insight'),
        excerpt:
          'February bloom, spring growth, summer hull split, August harvest — how the orchard calendar shapes availability, sizing, and new-crop pricing.',
        content:
          '<p>The almond year begins with February bloom, when orchards across the Central Valley turn white and pollination sets the crop&rsquo;s potential.</p>' +
          '<p>Spring growth fills the kernels; summer hull split signals maturity; and by August, shakers move through the rows and the new crop heads to hullers and processors.</p>' +
          '<p>For buyers, this calendar explains why sizing certainty improves through summer and why new-crop pricing finds its footing between July and September.</p>',
        coverImagePath: '/uploads/blog-posts/green-almond.jpg',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-03-14T08:00:00Z'),
        sortOrder: 6,
      },
      {
        title: 'Documentation Checklist: What We Prepare for Every Export Shipment',
        slug: 'documentation-checklist-every-export-shipment',
        categoryId: categoryId.get('company-news'),
        excerpt:
          'Commercial invoice, phytosanitary certificate, certificate of origin, and more — how Prime Nuts USA supports clean customs clearance at destination.',
        content:
          '<p>Every export shipment travels with a documentation set prepared for clean customs clearance: commercial invoice, packing list, certificate of origin, phytosanitary certificate, and bill of lading.</p>' +
          '<p>Depending on the destination we add product specifications, food-safety documentation, and laboratory testing results — so your customs broker has everything before the vessel arrives.</p>',
        coverImagePath: '/uploads/blog-posts/flatlay.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-02-08T08:00:00Z'),
        sortOrder: 7,
      },
    ];

    let created = 0;
    for (const post of posts) {
      const existing = await this.postRepo.findOneBy({ slug: post.slug });
      if (existing) continue;
      await this.postRepo.save(this.postRepo.create(post));
      created++;
    }

    console.log(
      created > 0
        ? `--- [Seed] Blog: created ${created} post(s).`
        : '--- [Seed] Blog: nothing missing, skipping.',
    );
  }
}
