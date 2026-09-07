import { FindOptionsOrder } from 'typeorm';

export const DEFAULT_ORDER: FindOptionsOrder<any> = {
  sort: 'ASC',
  id: 'DESC',
};
