import { createTRPCRouter } from "./init";
import { operatorRouter } from "./routers/operator";
import { advertisScorerRouter } from "./routers/advertis-scorer";
import { quickIntakeRouter } from "./routers/quick-intake";
import { devotionLadderRouter } from "./routers/devotion-ladder";
import { driverRouter } from "./routers/driver";
import { qualityReviewRouter } from "./routers/quality-review";
import { guildTierRouter } from "./routers/guild-tier";
import { guildOrgRouter } from "./routers/guild-org";
import { commissionRouter } from "./routers/commission";
import { membershipRouter } from "./routers/membership";
import { knowledgeGraphRouter } from "./routers/knowledge-graph";
import { deliverableTrackingRouter } from "./routers/deliverable-tracking";
import { processRouter } from "./routers/process";
import { guidelinesRouter } from "./routers/guidelines";
import { matchingRouter } from "./routers/matching";
import { valueReportRouter } from "./routers/value-report";
import { upsellRouter } from "./routers/upsell";
import { bootSequenceRouter } from "./routers/boot-sequence";
import { strategyRouter } from "./routers/strategy";
import { campaignRouter } from "./routers/campaign";
import { missionRouter } from "./routers/mission";
import { signalRouter } from "./routers/signal";
import { guildeRouter } from "./routers/guilde";

export const appRouter = createTRPCRouter({
  operator: operatorRouter,
  advertisScorer: advertisScorerRouter,
  quickIntake: quickIntakeRouter,
  devotionLadder: devotionLadderRouter,
  driver: driverRouter,
  qualityReview: qualityReviewRouter,
  guildTier: guildTierRouter,
  guildOrg: guildOrgRouter,
  commission: commissionRouter,
  membership: membershipRouter,
  knowledgeGraph: knowledgeGraphRouter,
  deliverableTracking: deliverableTrackingRouter,
  process: processRouter,
  guidelines: guidelinesRouter,
  matching: matchingRouter,
  valueReport: valueReportRouter,
  upsell: upsellRouter,
  bootSequence: bootSequenceRouter,
  strategy: strategyRouter,
  campaign: campaignRouter,
  mission: missionRouter,
  signal: signalRouter,
  guilde: guildeRouter,
});

export type AppRouter = typeof appRouter;
