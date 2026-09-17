/**
 * UI primitives dùng chung cho cả site public lẫn admin.
 * Import: import { Button, Card } from '@/components/ui';
 *
 * Quy tắc: chỉ đặt vào đây component KHÔNG biết gì về nghiệp vụ (không gọi API,
 * không import service/CMS). Component gắn với site hay admin vẫn ở
 * app/(site)/_components và app/admin/_components.
 */
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./button";
export { Badge, type BadgeProps, type BadgeTone } from "./badge";
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardHeaderProps,
} from "./card";
export { Spinner } from "./spinner";
export { Modal, type ModalProps } from "./modal";
