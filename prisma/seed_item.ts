import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({
  adapter,
});

// Banco de datos para generar variedad
const titles = ["Villa", "Chalet", "Casa", "Adosado", "Finca", "Propiedad"];
const areas = ["Las Rotas", "Montgó", "Les Marines", "Centro", "La Jara", "Devises"];
// const imageBank = [ // VENTA
//   "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
//   "https://images.pexels.com/photos/28449020/pexels-photo-28449020.jpeg",
//   "https://images.pexels.com/photos/28586227/pexels-photo-28586227.jpeg",
//   "https://images.pexels.com/photos/36394726/pexels-photo-36394726.jpeg",
//   "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
//   "https://images.pexels.com/photos/206172/pexels-photo-206172.jpeg",
//   "https://images.pexels.com/photos/34277699/pexels-photo-34277699.jpeg",
//   "https://images.pexels.com/photos/7501130/pexels-photo-7501130.jpeg",
//   "https://images.pexels.com/photos/20200275/pexels-photo-20200275.jpeg",
//   "https://images.pexels.com/photos/12558900/pexels-photo-12558900.jpeg",
//   "https://images.pexels.com/photos/11480454/pexels-photo-11480454.jpeg",
//   "https://images.pexels.com/photos/10647324/pexels-photo-10647324.jpeg",
// ];
const imageBank = [ // ALQUILER
  "https://images.pexels.com/photos/14460470/pexels-photo-14460470.jpeg",
  "https://images.pexels.com/photos/9826454/pexels-photo-9826454.jpeg",
  "https://images.pexels.com/photos/11266939/pexels-photo-11266939.jpeg",
  "https://images.pexels.com/photos/12261363/pexels-photo-12261363.jpeg",
  "https://images.pexels.com/photos/10925812/pexels-photo-10925812.jpeg",
  "https://images.pexels.com/photos/7851906/pexels-photo-7851906.jpeg",
  "https://images.pexels.com/photos/34733621/pexels-photo-34733621.jpeg",
  "https://images.pexels.com/photos/10043102/pexels-photo-10043102.jpeg",
  "https://images.pexels.com/photos/6208682/pexels-photo-6208682.jpeg",
  "https://images.pexels.com/photos/33252239/pexels-photo-33252239.jpeg",
  "https://images.pexels.com/photos/35651533/pexels-photo-35651533.jpeg",
];

export async function main() {
  const fst = 68;
  const lst = 102;
  console.log('🚀 Iniciando seed de items desde', fst, 'hasta', lst);

  function generateRandomPostgresDate(start: Date, end: Date): string {
    // Calculamos el tiempo aleatorio entre las dos fechas
    const randomTimestamp = Math.random() * (end.getTime() - start.getTime()) + start.getTime();

    // Creamos la fecha y la convertimos al formato ISO (que usa Postgres)
    return new Date(randomTimestamp).toISOString();
  }

  for (let i = fst; i <= lst; i++) {
    const itemRef = `REFL-${i.toString().padStart(3, '0')}/26`;

    // Cálculos aleatorios
    const builtSize = Math.floor(Math.random() * (200 - 60 + 1)) + 60;
    // const price = Math.round((builtSize * (Math.floor(Math.random() * 1500) + 1800)) / 1000) * 1000;  // VENTA
    const price = Math.round(builtSize * (Math.floor(Math.random() * 16) + 10)); // ALQUILER
    const rooms = Math.floor(Math.random() * 5) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const builtYear = Math.floor(Math.random() * (2020 - 1950 + 1)) + 1950;
    const updateAt = generateRandomPostgresDate(new Date(2020, 0, 1), new Date(2026, 0, 1));

    // Selección de imágenes (JSONb)
    const selectedImages = [
      { url: imageBank[i % imageBank.length] },
      { url: imageBank[(i + 1) % imageBank.length] }
    ];

    // Datos del Item principal
    const itemData: Prisma.ItemsCreateInput = {
      manager: {
        connect: { id: "uv9Xpuiifj1udIYgtlSrp5w8UqwdMVUG" }
      },
      itemName: `${titles[i % titles.length]} en ${areas[i % areas.length]}`,
      itemDescription: `Magnífica propiedad en Denia con ${rooms} habitaciones y acabados de alta calidad. Ubicación privilegiada en ${areas[i % areas.length]}.`,
      itemRef: itemRef,
      iprops: {
        create: {
          operType: "RENT",
          propType: "FLAT",
          updatedAt: updateAt,
          price: price,
          builtYear: builtYear,
          province: "Valencia",
          municipality: "Gandia",
          latitude: 38.9667,
          longitude: -0.1822,
          builtSize: builtSize,
          rooms: rooms,
          bathrooms: bathrooms,
          floor: Math.random() > 0.7 ? (Math.floor(Math.random() * 10) + 1).toString() : null,
          hasLift: Math.random() > 0.5,
          hasGarden: Math.random() > 0.3,
          hasPool: Math.random() > 0.4,
          hasGarage: Math.random() > 0.2,
          energyRating: i % 5 === 0 ? "PENDING" : (["A", "B", "C"][i % 3] as any),
          imgUrl: selectedImages as any,
          videoUrl: i % 3 === 0 ? "https://www.youtube.com/watch?v=5RpzdVLdv2k" : null,
          virtualTourUrl: i % 4 === 0 ? "https://my.matterport.com/show/?m=RsKKA9cRJnj&play=1&ts=0" : null,
        }
      }
    };

    // Usamos upsert basado en el itemRef que es @unique
    await prisma.items.upsert({
      where: { itemRef: itemRef },
      update: {}, // Si existe, no actualizamos nada para no pisar datos
      create: itemData,
    });
  }

  console.log("✅ Inmuebles procesados correctamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Error en el seed de items:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });