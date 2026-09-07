export class CreateNotificationDto {
  type: string;
  module: string;
  title: string;
  message?: string;
}