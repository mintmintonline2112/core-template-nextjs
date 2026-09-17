# `components/ui` — UI primitives dùng chung

Thư mục này chứa các khối giao diện **không biết gì về nghiệp vụ**: không gọi API,
không import service, không phụ thuộc CMS. Vì vậy dùng được ở cả site public
(`app/(site)`) lẫn admin (`app/admin`).

| Component | Loại | Khi nào dùng |
|---|---|---|
| `Button` | Server | Nút hoặc link dạng nút. Có `href` → render `<Link>`. Variant: primary, gold, outline, ghost, danger. |
| `Badge` | Server | Nhãn trạng thái nhỏ (Draft, Published, Mới…). Tone: navy (mặc định), gold, neutral, danger. |
| `Card` + `CardHeader/Body/Footer` | Server | Khung nội dung có viền, dùng cho dashboard, block CMS. |
| `Spinner` | Server | Vòng xoay loading, kế thừa màu chữ hiện tại. |
| `Modal` | **Client** | Hộp thoại dựa trên `<dialog>`; cần hook nên có `'use client'`. |

## Cách dùng

```tsx
import { Button, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { adminRoutes } from '@/config/routes';

// Trong một Server Component (page.tsx, section CMS…)
<Card>
  <CardHeader title="Bài viết" action={<Button size="sm" variant="outline" href={adminRoutes.blogPosts.list}>Xem tất cả</Button>} />
  <CardBody>
    <Badge tone="gold">Draft</Badge>
  </CardBody>
</Card>
```

```tsx
'use client';
import { useState } from 'react';
import { Button, Modal } from '@/components/ui';

export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Xoá</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xoá bài viết?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button variant="danger" onClick={onConfirm}>Xoá</Button>
          </>
        }
      >
        Hành động này không thể hoàn tác.
      </Modal>
    </>
  );
}
```

## Quy tắc

1. **Mặc định là Server Component.** Chỉ thêm `'use client'` khi file đó tự dùng
   hook, event listener hay browser API (như `Modal`). `Button` nhận `onClick`
   nhưng không cần `'use client'`: handler chỉ chạy khi Button nằm trong một
   Client Component, còn trong Server Component thì dùng `href` / `type="submit"`.
2. **Style viết bằng class Tailwind ngay trong component** (không có file CSS
   riêng). Biến thể (variant/size/tone) là một object map class; `className`
   truyền vào được ghép sau cùng qua `cn()` nên đè được mọi class mặc định.
   Màu dùng token brand (`navy-700`, `gold-400`…) — cả site lẫn admin đều nạp
   `styles/tailwind.css` nên dùng được ở hai nơi.
3. **Component có nghiệp vụ không đặt ở đây.** `DataTable`, `GenericForm`,
   `LibraryPicker` thuộc `app/admin/_components`; `Header`, `Footer`,
   `SectionRenderer` thuộc `app/(site)/_components`.
4. Thêm component mới: tạo file `ten-component.tsx` (style bằng Tailwind),
   export trong `index.ts`.
