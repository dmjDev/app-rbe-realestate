import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

// Configuración del Pool de Postgres para el adaptador
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({
  adapter,
});

// Definimos los datos de tus roles usando el tipo generado por Prisma
const rolesData: Prisma.RoleCreateInput[] = [
  { name: 'superAdmin', level: 1000 },
  { name: 'administrator', level: 100 },
  { name: 'dataManagerPremium', level: 13 },
  { name: 'dataManagerProPlus', level: 12 },
  { name: 'dataManagerPro', level: 11 },
  { name: 'dataManager', level: 10 },
  { name: 'clientPlus', level: 2 },
  { name: 'client', level: 1 },
];

export async function main() {
  console.log("🚀 Iniciando siembra de roles...");
  
  for (const role of rolesData) {
    // Usamos upsert para evitar errores si el nombre o nivel ya existen
    await prisma.role.upsert({
      where: { name: role.name }, // 'name' debe ser @unique en tu schema
      update: { level: role.level },
      create: role,
    });
  }
  
  console.log("✅ Roles procesados correctamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end(); // Importante cerrar el pool de pg también
  })
  .catch(async (e) => {
    console.error("❌ Error en el seed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
