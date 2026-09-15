import type { AgentApproval, AgentResult } from "@/domain/agents";
import type { PipelineApprovalCheckpoint, PipelineCheckpoint, PipelineContext, PipelineKnowledge, PipelineRunResult, PipelineStep } from "./pipeline-types";
import type { PipelineAgents } from "./pipeline-types";

const subjectInput = (context: PipelineContext) => ({ id: context.subject.id, name: context.subject.name, description: context.subject.description });

const checkpointApproval = (checkpoint?: PipelineApprovalCheckpoint): AgentApproval | undefined => checkpoint?.approval;
const requiresApproval = (checkpoint?: PipelineApprovalCheckpoint) => checkpoint?.approvalRequired ?? false;
const isApproved = (checkpoint?: PipelineApprovalCheckpoint) => !requiresApproval(checkpoint) || checkpoint?.approval?.status === "approved";

export class AgentPipeline {
  constructor(private readonly agents: PipelineAgents, private readonly knowledge: PipelineKnowledge) {}

  async run(context: PipelineContext): Promise<PipelineRunResult> {
    const steps: PipelineStep[] = [];
    const confidence: PipelineRunResult["confidence"] = {};
    const warnings: string[] = [];
    const agentReasoning: PipelineRunResult["agentReasoning"] = [];
    const researchCheckpoint = context.approvalCheckpoints?.research;

    const researchResult = await this.agents.research.agent.research({
      subject: subjectInput(context),
      sourceCandidates: context.subject.researchReports.flatMap((report) => report.sources),
      existingReports: context.subject.researchReports,
    }, context.agentContext);
    const researchStep = this.toStep(this.agents.research.name, `Subject ${context.subject.name}; ${context.subject.researchReports.length} existing report(s).`, `Research report with ${researchResult.data.claims.length} claim(s).`, researchResult, researchCheckpoint);
    steps.push(researchStep);
    confidence.research = researchResult.confidence;
    warnings.push(...researchResult.warnings);
    agentReasoning.push({ agentName: researchStep.agentName, reasoning: researchStep.reasoning });

    if (!isApproved(researchCheckpoint)) {
      return this.pendingResult(context, "research", steps, { researchReport: researchResult.data }, agentReasoning, confidence, warnings);
    }

    const decisionsCheckpoint = context.approvalCheckpoints?.decisions;
    const decisionsResult = await this.agents.artDirector.agent.createDecisions({
      subjectId: context.subject.id,
      researchReport: researchResult.data,
      availableVisualGoals: this.knowledge.visualGoals,
      availableTechniques: this.knowledge.productionTechniques,
      existingDecisions: context.subject.artDirectionDecisions,
    }, context.agentContext);
    const decisionsStep = this.toStep(this.agents.artDirector.name, `Research report with ${researchResult.data.claims.length} claim(s); ${this.knowledge.visualGoals.length} goal(s); ${this.knowledge.productionTechniques.length} technique(s).`, `${decisionsResult.data.length} art-direction decision(s).`, decisionsResult, decisionsCheckpoint);
    steps.push(decisionsStep);
    confidence.artDirector = decisionsResult.confidence;
    warnings.push(...decisionsResult.warnings);
    agentReasoning.push({ agentName: decisionsStep.agentName, reasoning: decisionsStep.reasoning });

    if (!isApproved(decisionsCheckpoint)) {
      return this.pendingResult(context, "decisions", steps, { researchReport: researchResult.data, decisions: decisionsResult.data }, agentReasoning, confidence, warnings);
    }

    const shotPlanResult = await this.agents.shotPlanner.agent.createShotPlan({
      subject: subjectInput(context),
      decisions: decisionsResult.data,
      availableVisualGoals: this.knowledge.visualGoals,
      availableTechniques: this.knowledge.productionTechniques,
      existingShotPlan: context.subject.shotPlans[0],
    }, context.agentContext);
    const shotPlanStep = this.toStep(this.agents.shotPlanner.name, `${decisionsResult.data.length} decision(s); ${this.knowledge.productionTechniques.length} technique(s).`, `Shot plan with ${shotPlanResult.data.shots.length} shot(s).`, shotPlanResult);
    steps.push(shotPlanStep);
    confidence.shotPlanner = shotPlanResult.confidence;
    warnings.push(...shotPlanResult.warnings);
    agentReasoning.push({ agentName: shotPlanStep.agentName, reasoning: shotPlanStep.reasoning });

    return {
      executionId: context.execution.id,
      subjectId: context.subject.id,
      status: "completed",
      steps,
      outputs: { researchReport: researchResult.data, decisions: decisionsResult.data, shotPlan: shotPlanResult.data },
      agentReasoning,
      confidence,
      warnings,
      approval: { status: "not-required", checkpoints: context.approvalCheckpoints ?? {}, continuation: context.continuation },
      continuation: context.continuation,
      executionMetadata: context.execution.metadata,
    };
  }

  private toStep<T>(agentName: string, inputSummary: string, outputSummary: string, result: AgentResult<T>, checkpoint?: PipelineApprovalCheckpoint): PipelineStep {
    return { agentName, inputSummary, outputSummary, reasoning: result.reasoning, confidence: result.confidence, warnings: result.warnings, approvalRequired: requiresApproval(checkpoint), approval: checkpointApproval(checkpoint) ?? result.approval, reviewReferences: [...new Set([...(checkpoint?.reviewRecordIds ?? []), ...(result.reviewReferences ?? [])])], resultMetadata: result.metadata };
  }

  private pendingResult(context: PipelineContext, checkpoint: PipelineCheckpoint, steps: PipelineStep[], outputs: PipelineRunResult["outputs"], agentReasoning: PipelineRunResult["agentReasoning"], confidence: PipelineRunResult["confidence"], warnings: string[]): PipelineRunResult {
    return {
      executionId: context.execution.id,
      subjectId: context.subject.id,
      status: "awaiting-approval",
      steps,
      outputs,
      agentReasoning,
      confidence,
      warnings,
      approval: { status: "pending", pendingCheckpoint: checkpoint, checkpoints: context.approvalCheckpoints ?? {}, continuation: context.continuation },
      continuation: context.continuation,
      executionMetadata: context.execution.metadata,
    };
  }
}
