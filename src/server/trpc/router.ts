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
import { ambassadorRouter } from "./routers/ambassador";
import { socialRouter } from "./routers/social";
import { mediaBuyingRouter } from "./routers/media-buying";
import { prRouter } from "./routers/pr";
import { marketStudyRouter } from "./routers/market-study";
import { brandVaultRouter } from "./routers/brand-vault";
import { interventionRouter } from "./routers/intervention";
import { frameworkRouter } from "./routers/framework";
import { gloryRouter } from "./routers/glory";
import { analyticsRouter } from "./routers/analytics";
import { cockpitRouter } from "./routers/cockpit";
import { clubRouter } from "./routers/club";
import { eventRouter } from "./routers/event";
import { boutiqueRouter } from "./routers/boutique";
import { sourceInsightsRouter } from "./routers/source-insights";
import { onboardingRouter } from "./routers/onboarding";
import { messagingRouter } from "./routers/messaging";
import { crmRouter } from "./routers/crm";
import { translationRouter } from "./routers/translation";
import { attributionRouter } from "./routers/attribution";
import { cohortRouter } from "./routers/cohort";
import { publicationRouter } from "./routers/publication";

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
  ambassador: ambassadorRouter,
  social: socialRouter,
  mediaBuying: mediaBuyingRouter,
  pr: prRouter,
  marketStudy: marketStudyRouter,
  brandVault: brandVaultRouter,
  intervention: interventionRouter,
  framework: frameworkRouter,
  glory: gloryRouter,
  analytics: analyticsRouter,
  cockpit: cockpitRouter,
  club: clubRouter,
  event: eventRouter,
  boutique: boutiqueRouter,
  sourceInsights: sourceInsightsRouter,
  onboarding: onboardingRouter,
  messaging: messagingRouter,
  crm: crmRouter,
  translation: translationRouter,
  attribution: attributionRouter,
  cohort: cohortRouter,
  publication: publicationRouter,
});

export type AppRouter = typeof appRouter;
