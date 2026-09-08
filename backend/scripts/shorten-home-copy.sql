-- ============================================================
-- Rút gọn chữ trang chủ (một lần, an toàn chạy lại).
-- Bối cảnh: seed chỉ insert lần đầu, không đè dữ liệu cũ — nên DB
-- đã deploy vẫn giữ bản văn dài. File này đưa các section của trang
-- 'home' về bản copy ngắn (khớp page.seed.ts + fallback frontend).
-- Chỉ đụng: content của 8 section + metadata.reasons / .configurations.
-- Cách chạy: import trong phpMyAdmin/HeidiSQL vào DB `primenuts`,
-- hoặc:  mysql -u primenuts -p primenuts < shorten-home-copy.sql
-- Sau khi chạy: đợi ISR ~60s hoặc gọi revalidate là site cập nhật.
-- ============================================================

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Prime Nuts USA connects California almond supply with commercial buyers in the U.S. and worldwide &mdash; reliable supply, consistent quality, competitive B2B pricing.</p>'
WHERE ps.section_key = 'hero';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>California sits at the center of the global almond industry &mdash; we give B2B buyers direct access to it, at home and abroad.</p>'
WHERE ps.section_key = 'markets';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Natural almond kernels in the varieties, sizes, and grades your market requires.</p>'
WHERE ps.section_key = 'products-overview';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>From domestic wholesale volumes to international container shipments.</p>',
    ps.metadata = JSON_SET(ps.metadata, '$.configurations', CAST('[
      {"title":"Full Container Load — FCL","text":"20′ & 40′ ocean containers."},
      {"title":"50 lb Cartons","text":"The industry-standard export carton."},
      {"title":"Palletized Shipments","text":"Stretch-wrapped, export-ready."},
      {"title":"Bulk Packaging","text":"Totes & bins for manufacturing lines."},
      {"title":"Custom Commercial Packaging","text":"Tailored on request."}
    ]' AS JSON))
WHERE ps.section_key = 'orders';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Our California location plugs us straight into the world&rsquo;s most established almond supply chain.</p>'
WHERE ps.section_key = 'sourcing';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Depending on the transaction and destination, we coordinate or support:</p>'
WHERE ps.section_key = 'logistics';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Established buyers and new-market developers alike are welcome.</p>'
WHERE ps.section_key = 'who-we-serve';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.metadata = JSON_SET(ps.metadata, '$.reasons', CAST('[
      {"title":"California Based","text":"At the source of the world''s leading almond industry."},
      {"title":"Reliable Sourcing","text":"Established growers, handlers, processors, and packers."},
      {"title":"B2B Focus","text":"Built for commercial buyers and wholesale volumes."},
      {"title":"Flexible Specifications","text":"Varieties, sizes, grades, and packaging to your spec."},
      {"title":"Global Trade Support","text":"We move California almonds into international markets."},
      {"title":"Long-Term Partnerships","text":"Consistency, transparency, and reliable execution."}
    ]' AS JSON))
WHERE ps.section_key = 'why-us';

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.content = '<p>Importers, distributors, wholesalers, food manufacturers &mdash; tell us what you need:</p>'
WHERE ps.section_key = 'quote-cta';
