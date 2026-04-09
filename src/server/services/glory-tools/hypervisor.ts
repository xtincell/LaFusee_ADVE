/**
 * @deprecated Use @/server/services/mestor/hyperviseur instead.
 * The sequence recommendation functions (analyzeAndRecommend, etc.) have been
 * merged into the mestor hyperviseur during the v4 restructuration.
 */
export {
  buildPlan,
  executePlan,
  executeNextStep,
  resolveHumanStep,
  persistPlan,
  loadPlan,
  resumePlan,
  type OrchestrationPlan,
  type OrchestrationStep,
  type StrategyPhase,
  type StepAgent,
} from "@/server/services/mestor/hyperviseur";
