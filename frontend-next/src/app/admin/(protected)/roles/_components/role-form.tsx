'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/utils';
import {
  permissionService,
  PERMISSION_QUERY_KEY,
  type Permission,
} from '@/app/admin/(protected)/permissions/_lib/permission.service';
import { roleService, ROLE_QUERY_KEY } from '@/app/admin/(protected)/roles/_lib/role.service';
import { adminRoutes } from '@/config/routes';

/**
 * Form vai trò: name + description + bảng chọn quyền gộp theo module,
 * mỗi module có nút chọn/bỏ cả nhóm. Không dùng GenericForm vì phần chọn
 * quyền là dạng lưới checkbox đặc thù.
 */
export function RoleForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: permissions } = useQuery({
    queryKey: [...PERMISSION_QUERY_KEY, 'options'],
    queryFn: () => permissionService.paginate({ limit: 1000 }),
  });

  const { data: role } = useQuery({
    queryKey: [...ROLE_QUERY_KEY, 'detail', id],
    queryFn: () => roleService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (role) {
      setName(role.name ?? '');
      setDescription(role.description ?? '');
      setSelectedIds(new Set((role.permissions ?? []).map((p) => p.id)));
    }
  }, [role]);

  const byModule = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const p of permissions?.data ?? []) {
      const key = p.module || 'khác';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const isAdminRole = role?.name?.toUpperCase() === 'ADMIN';

  function togglePermission(pid: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  function toggleModule(perms: Permission[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = perms.every((p) => next.has(p.id));
      for (const p of perms) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên vai trò không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: Array.from(selectedIds),
      };

      if (isEdit) await roleService.edit(id!, payload);
      else await roleService.add(payload);

      await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật vai trò' : 'Đã tạo vai trò');
      router.push(adminRoutes.roles.list);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="gf-header">
        <button
          type="button"
          onClick={() => router.push(adminRoutes.roles.list)}
          className="gf-back"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="adm-page-title">{isEdit ? 'Sửa vai trò' : 'Tạo vai trò'}</h1>
          <p className="adm-page-subtitle">
            {isEdit ? 'Cập nhật nhóm quyền quản trị' : 'Thêm nhóm quyền quản trị mới'}
          </p>
          <nav className="gf-breadcrumbs">
            <span>
              <Link href={adminRoutes.roles.list}>Vai trò</Link>
              <span style={{ margin: '0 4px' }}>/</span>
            </span>
            <span>{isEdit ? 'Sửa' : 'Tạo mới'}</span>
          </nav>
        </div>
      </div>

      {isAdminRole && (
        <p className="rl-admin-note">
          Vai trò Admin là vai trò hệ thống — backend không cho phép sửa hoặc xóa.
        </p>
      )}

      <div className="gf-card">
        <div>
          <label className="gf-label">
            Tên vai trò<span className="gf-required">*</span>
          </label>
          <input
            className="gf-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Biên tập viên"
            disabled={isAdminRole}
          />
        </div>
        <div>
          <label className="gf-label">Mô tả</label>
          <textarea
            className="gf-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Phạm vi của vai trò này"
            disabled={isAdminRole}
          />
        </div>

        <div>
          <label className="gf-label">
            Quyền truy cập ({selectedIds.size} đã chọn)
          </label>
          <div className="rl-modules">
            {byModule.map(([module, perms]) => {
              const allSelected = perms.every((p) => selectedIds.has(p.id));
              return (
                <div key={module} className="rl-module">
                  <div className="rl-module-head">
                    <strong>{module}</strong>
                    <button
                      type="button"
                      className="rl-module-toggle"
                      onClick={() => toggleModule(perms)}
                      disabled={isAdminRole}
                    >
                      {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="rl-perms">
                    {perms.map((p) => (
                      <label key={p.id} className="rl-perm" title={p.code}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => togglePermission(p.id)}
                          disabled={isAdminRole}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!isAdminRole && (
        <div className="gf-actions">
          <button type="button" onClick={() => router.push(adminRoutes.roles.list)} className="adm-btn">
            Hủy
          </button>
          <button type="submit" disabled={submitting} className="adm-btn adm-btn--primary">
            {submitting && <span className="adm-spin" />}
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      )}
    </form>
  );
}
