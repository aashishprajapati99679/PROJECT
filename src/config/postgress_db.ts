import "dotenv/config";
import { DataSourceOptions } from 'typeorm';
import { UserRigestration } from '../modules/users/entities/user.register.entities.js';

export const pgConfig: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DB_POSTGRESS_URL,
    entities: [UserRigestration],
    synchronize: true,  // Auto-creates/updates table schema in development
    // dropSchema: true,   // ⚠️ TEMP: Drops & recreates schema on start — remove after first successful run!
}