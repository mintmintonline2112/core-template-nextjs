'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { adminApi } from '@/admin/core/admin-api';
import { getErrorMessage } from '@/admin/lib/utils';

/**
 * Van an toàn cho cache: xóa toàn bộ cache backend + fetch cache của Next
 * (menu, trang, bài viết) trong một cú bấm. Bình thường mọi thao tác ghi đã
 * tự invalidate — nút này dành cho các ca ngoài luồng: sửa DB trực tiếp,
 * chạy lại seed, backend vừa restart, hoặc env revalidate cấu hình sai.
 */
export function PurgeCacheButton() {
  const [purging, setPurging] = useState(false);

  async function handlePurge() {
    setPurging(true);
    try {
      const result = await adminApi.post<{ purged: string[] }>('admin/cache/purge');
      toast.success(
        `Đã làm mới website (${result.purged.length} vùng cache: ${result.purged.join(', ')})`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPurging(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-secondary-button"
      onClick={handlePurge}
      disabled={purging}
      title="Xóa cache backend + Next để website public hiển thị nội dung mới nhất"
    >
      {purging ? <span className="adm-spin adm-spin--dark" /> : <Zap size={16} />}
      {purging ? 'Đang làm mới…' : 'Làm mới website'}
    </button>
  );
}
