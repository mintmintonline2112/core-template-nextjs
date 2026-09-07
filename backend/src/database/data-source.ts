import { join } from 'path';
import { DataSource } from 'typeorm';
import { createTypeOrmOptionsFromEnv } from './typeorm-options';

// Glob theo __dirname (đổi \ thành / cho Windows) để CLI chạy được cả hai chế độ:
// dev qua ts-node (src/database) lẫn production từ bản build (dist/database)
// — db:run:prod / db:seed:prod trên VPS không cần ts-node/devDependencies.
const fromHere = (...segments: string[]) =>
  join(__dirname, ...segments).replace(/\\/g, '/');

export const AppDataSource = new DataSource({
  ...createTypeOrmOptionsFromEnv(process.env),
  entities: [fromHere('..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [fromHere('migrations', '*{.ts,.js}')],
});
