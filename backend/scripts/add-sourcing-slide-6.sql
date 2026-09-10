-- ============================================================
-- Chuỗi sourcing có 6 bước nhưng metadata.slides chỉ có 5 ảnh
-- → bấm ô số 6 phải dùng lại ảnh số 5. Script này thêm ảnh thứ 6
-- để mỗi bước có ảnh riêng.
--
-- An toàn: chỉ chạy khi section đang có ĐÚNG 5 slide, nên chạy lại
-- nhiều lần cũng không thêm trùng.
--
-- Chạy:  mysql -u primenuts -p primenuts < add-sourcing-slide-6.sql
-- Sau đó vào admin → Page sections → sourcing để đổi ảnh/caption nếu muốn.
-- ============================================================

UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
SET ps.metadata = JSON_ARRAY_APPEND(
      ps.metadata,
      '$.slides',
      CAST('{"image":"/images/almonds-ramekin.webp","caption":"Ready for retail & distribution"}' AS JSON)
    )
WHERE ps.section_key = 'sourcing'
  AND JSON_LENGTH(ps.metadata, '$.slides') = 5;

SELECT JSON_LENGTH(ps.metadata, '$.slides') AS so_slide_sau_khi_chay
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id AND p.slug = 'home'
WHERE ps.section_key = 'sourcing';
