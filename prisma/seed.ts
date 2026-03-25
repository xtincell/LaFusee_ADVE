import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create the UPgraders operator (the first and owner operator)
  const operator = await prisma.operator.upsert({
    where: { slug: "upgraders" },
    update: {},
    create: {
      name: "UPgraders SARL",
      slug: "upgraders",
      status: "ACTIVE",
      licenseType: "OWNER",
      maxBrands: 50,
      commissionRate: 0.10,
      licensedAt: new Date(),
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      branding: {
        primaryColor: "#6C3CE0",
        logo: "/images/upgraders-logo.svg",
        tagline: "De la Poussière à l'Étoile",
      },
    },
  });

  console.log(`Operator created: ${operator.name} (${operator.id})`);

  // Create the admin user (Alexandre / The Fixer)
  const admin = await prisma.user.upsert({
    where: { email: "alexandre@upgraders.com" },
    update: {},
    create: {
      name: "Alexandre Djengue Mbangue",
      email: "alexandre@upgraders.com",
      role: "ADMIN",
      operatorId: operator.id,
    },
  });

  console.log(`Admin user created: ${admin.name} (${admin.id})`);

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
