import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create the UPgraders operator
  const operator = await prisma.operator.upsert({
    where: { slug: "upgraders" },
    update: {},
    create: {
      name: "UPgraders SARL",
      slug: "upgraders",
      status: "ACTIVE",
      licenseType: "OWNER",
      licensedAt: new Date(),
      licenseExpiry: new Date("2030-12-31"),
      maxBrands: 50,
      commissionRate: 0.10,
      branding: {
        primaryColor: "#6C3CE0",
        logo: "/images/upgraders-logo.svg",
        tagline: "De la Poussière à l'Étoile",
      } as Prisma.InputJsonValue,
    },
  });
  console.log(`Operator: ${operator.name}`);

  // 2. Create admin user (Alexandre / The Fixer)
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
  console.log(`Admin: ${admin.name}`);

  // 3. Create demo Strategy (Brand Instance)
  const strategy = await prisma.strategy.upsert({
    where: { id: "demo-strategy-cimencam" },
    update: {},
    create: {
      id: "demo-strategy-cimencam",
      name: "CIMENCAM",
      description: "Cimenteries du Cameroun — leader du ciment en Afrique centrale",
      userId: admin.id,
      operatorId: operator.id,
      status: "ACTIVE",
      advertis_vector: {
        a: 18, d: 15, v: 20, e: 12, r: 14, t: 16, i: 11, s: 17,
        composite: 123, confidence: 0.75,
      } as Prisma.InputJsonValue,
    },
  });
  console.log(`Strategy: ${strategy.name}`);

  // 4. Create Pillars for the demo strategy
  const pillarData: Array<{ key: string; content: Prisma.InputJsonValue; confidence: number }> = [
    { key: "a", content: { vision: "Bâtir l'Afrique de demain", mission: "Fournir les matériaux de construction les plus fiables", values: ["fiabilité", "proximité", "innovation"] } as Prisma.InputJsonValue, confidence: 0.8 },
    { key: "d", content: { positioning: "Le ciment qui construit l'Afrique", visualIdentity: "Rouge et blanc", voiceOfBrand: "Autoritaire mais accessible" } as Prisma.InputJsonValue, confidence: 0.7 },
    { key: "v", content: { promise: "Un ciment de qualité mondiale à prix accessible", products: ["CIMENCAM 32.5", "CIMENCAM 42.5", "CIMENCAM PLUS"], experience: "Distribution capillaire" } as Prisma.InputJsonValue, confidence: 0.85 },
    { key: "e", content: { communities: ["Artisans du bâtiment", "Distributeurs"], channels: ["Facebook", "Points de vente"], rituals: [] } as Prisma.InputJsonValue, confidence: 0.5 },
    { key: "r", content: { risks: ["Concurrence nigériane", "Volatilité des matières premières"], crisisPlan: false, reputation: "Solide mais peu différenciée" } as Prisma.InputJsonValue, confidence: 0.6 },
    { key: "t", content: { kpis: ["Part de marché", "Volume de ventes", "Satisfaction distributeurs"], validation: "Leader marché confirmé" } as Prisma.InputJsonValue, confidence: 0.7 },
    { key: "i", content: { roadmap: "Non formalisée", team: "Direction marketing + agence externe", budget: "Confidentiel" } as Prisma.InputJsonValue, confidence: 0.45 },
    { key: "s", content: { guidelines: "Charte graphique basique", bible: false, coherence: "Moyenne — plusieurs prestataires non alignés" } as Prisma.InputJsonValue, confidence: 0.65 },
  ];

  for (const p of pillarData) {
    await prisma.pillar.upsert({
      where: { strategyId_key: { strategyId: strategy.id, key: p.key } },
      update: { content: p.content, confidence: p.confidence },
      create: { strategyId: strategy.id, key: p.key, content: p.content, confidence: p.confidence },
    });
  }
  console.log("Pillars seeded (8)");

  // 5. Create demo Drivers
  const driverData = [
    { channel: "INSTAGRAM" as const, channelType: "DIGITAL" as const, name: "Instagram CIMENCAM" },
    { channel: "FACEBOOK" as const, channelType: "DIGITAL" as const, name: "Facebook CIMENCAM" },
    { channel: "EVENT" as const, channelType: "EXPERIENTIAL" as const, name: "Salons BTP" },
    { channel: "PR" as const, channelType: "MEDIA" as const, name: "Relations Presse" },
  ];

  for (const d of driverData) {
    await prisma.driver.upsert({
      where: { id: `demo-driver-${d.channel.toLowerCase()}` },
      update: {},
      create: {
        id: `demo-driver-${d.channel.toLowerCase()}`,
        strategyId: strategy.id,
        channel: d.channel,
        channelType: d.channelType,
        name: d.name,
        formatSpecs: {} as Prisma.InputJsonValue,
        constraints: {} as Prisma.InputJsonValue,
        briefTemplate: {} as Prisma.InputJsonValue,
        qcCriteria: {} as Prisma.InputJsonValue,
        pillarPriority: {} as Prisma.InputJsonValue,
      },
    });
  }
  console.log("Drivers seeded (4)");

  // 6. Create demo DevotionSnapshot
  await prisma.devotionSnapshot.create({
    data: {
      strategyId: strategy.id,
      spectateur: 40, interesse: 25, participant: 18,
      engage: 10, ambassadeur: 5, evangeliste: 2,
      devotionScore: 32.6,
      trigger: "seed",
    },
  });
  console.log("DevotionSnapshot seeded");

  // 7. Create demo TalentProfiles (Guild members)
  const talents = [
    { email: "marc@freelance.cm", name: "Marc Nzouankeu", tier: "MAITRE" as const, skills: ["design", "branding", "illustration"], totalMissions: 45, firstPassRate: 0.82, peerReviews: 18 },
    { email: "sarah@freelance.cm", name: "Sarah Mbida", tier: "COMPAGNON" as const, skills: ["copywriting", "social-media", "storytelling"], totalMissions: 22, firstPassRate: 0.75, peerReviews: 8 },
    { email: "paul@freelance.cm", name: "Paul Essomba", tier: "APPRENTI" as const, skills: ["video", "motion-design"], totalMissions: 5, firstPassRate: 0.60, peerReviews: 1 },
  ];

  for (const t of talents) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { name: t.name, email: t.email, role: "FREELANCE", operatorId: operator.id },
    });
    await prisma.talentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: t.name,
        tier: t.tier,
        skills: t.skills as Prisma.InputJsonValue,
        totalMissions: t.totalMissions,
        firstPassRate: t.firstPassRate,
        peerReviews: t.peerReviews,
        avgScore: 7.5,
      },
    });
  }
  console.log("TalentProfiles seeded (3)");

  // 8. Knowledge Seeder — inject Alexandre's expertise (F.3 cold start)
  const knowledgeSeeds: Array<Prisma.KnowledgeEntryCreateInput> = [
    {
      entryType: "SECTOR_BENCHMARK",
      sector: "FMCG",
      market: "CM",
      data: { avgComposite: 95, topQuartile: 135, sampleSize: 12, insight: "FMCG brands in Cameroon average Ordinaire. Distinction (D) is the most common weakness." } as Prisma.InputJsonValue,
      successScore: 0.6,
      sampleSize: 12,
      sourceHash: "seed-expertise",
    },
    {
      entryType: "SECTOR_BENCHMARK",
      sector: "BANQUE",
      market: "CM",
      data: { avgComposite: 110, topQuartile: 150, sampleSize: 8, insight: "Banking brands have strong Track (T) but weak Engagement (E). Community building is the biggest opportunity." } as Prisma.InputJsonValue,
      successScore: 0.65,
      sampleSize: 8,
      sourceHash: "seed-expertise",
    },
    {
      entryType: "SECTOR_BENCHMARK",
      sector: "TELECOM",
      market: "CM",
      data: { avgComposite: 125, topQuartile: 160, sampleSize: 5, insight: "Telecom brands invest heavily in Implementation (I) but often lack Authenticité (A). MTN and Orange dominate but are interchangeable." } as Prisma.InputJsonValue,
      successScore: 0.7,
      sampleSize: 5,
      sourceHash: "seed-expertise",
    },
    {
      entryType: "BRIEF_PATTERN",
      channel: "INSTAGRAM",
      data: { successRate: 0.78, bestPractices: ["Include brand voice guidelines", "Specify pillar priority", "Reference 2-3 benchmark posts"], avgRevisions: 1.2 } as Prisma.InputJsonValue,
      successScore: 0.78,
      sampleSize: 50,
      sourceHash: "seed-expertise",
    },
    {
      entryType: "BRIEF_PATTERN",
      channel: "VIDEO",
      data: { successRate: 0.65, bestPractices: ["Storyboard required", "Brand intro < 3s", "CTA in last 5s"], avgRevisions: 2.1 } as Prisma.InputJsonValue,
      successScore: 0.65,
      sampleSize: 30,
      sourceHash: "seed-expertise",
    },
    {
      entryType: "CREATOR_PATTERN",
      data: { insight: "Creators with design + branding skills have 30% higher first-pass rate. Tier promotion from APPRENTI to COMPAGNON averages 6 months.", topSkillCombos: [["design", "branding"], ["video", "motion-design"], ["copywriting", "storytelling"]] } as Prisma.InputJsonValue,
      successScore: 0.7,
      sampleSize: 25,
      sourceHash: "seed-expertise",
    },
  ];

  for (const entry of knowledgeSeeds) {
    await prisma.knowledgeEntry.create({ data: entry });
  }
  console.log(`Knowledge seeded (${knowledgeSeeds.length} entries)`);

  console.log("\nSeed completed successfully.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
