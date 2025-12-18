import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
// @ts-ignore - Path is correct at runtime from dist/src/lib/
import { PrismaClient } from '../../../generated/prisma/index.js';
const connectionString = `${process.env.DATABASE_URL}`;
if (!connectionString) {
    throw new Error("Database URL not defined!");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
export { prisma };
//# sourceMappingURL=prisma.js.map