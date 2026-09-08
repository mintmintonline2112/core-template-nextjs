import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { getErrorMessage } from './utils';

interface ConfirmConfig {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  confirmButtonColor?: string;
}

/**
 * Show a confirm dialog, run the async action only if confirmed, then surface a
 * success/error dialog. Returns whether the action ran successfully.
 */
export async function confirmAction(
  config: ConfirmConfig,
  action: () => Promise<unknown>,
): Promise<boolean> {
  const result = await Swal.fire({
    title: config.title,
    text: config.text,
    icon: config.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonColor: config.confirmButtonColor ?? '#ff3838',
    cancelButtonColor: '#6b7280',
    confirmButtonText: config.confirmButtonText ?? 'Xác nhận',
    cancelButtonText: 'Hủy',
  });

  if (!result.isConfirmed) return false;

  try {
    await action();
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Thao tác đã được thực hiện.',
      confirmButtonColor: '#000',
      confirmButtonText: 'OK',
    });
    return true;
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: getErrorMessage(err),
      confirmButtonColor: '#000',
    });
    return false;
  }
}
