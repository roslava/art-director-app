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

    const outputs: PipelineRunResult["outputs"] = { researchReport: researchResult.data, decisions: decisionsResult.data, shotPlan: shotPlanResult.data };
    if (this.agents.generator && context.generation?.requests.length) {
      const generationRequests = context.generation.requests.filter((request) => shotPlanResult.data.shots.some((shot) => shot.id === request.shotId));
      const generationResults = await Promise.all(generationRequests.map((request) => this.agents.generator?.agent.generate(request, context.agentContext)));
      const completedGenerationResults = generationResults.filter((result): result is NonNullable<typeof result> => result !== undefined);
      const generationWarnings = completedGenerationResults.flatMap((result) => result.warnings);
      const generationStep: PipelineStep = {
        agentName: this.agents.generator.name,
        inputSummary: `${generationRequests.length} request(s) linked to the shot plan.`,
        outputSummary: `${completedGenerationResults.length} mock/provider generation output(s).`,
        reasoning: {
          explanation: "Collected generation outputs after shot planning.",
          assumptions: completedGenerationResults.flatMap((result) => result.reasoning.assumptions),
          uncertainties: completedGenerationResults.flatMap((result) => result.reasoning.uncertainties),
          evidenceIds: completedGenerationResults.flatMap((result) => result.reasoning.evidenceIds),
        },
        confidence: { level: "aggregated", rationale: "Generation confidence is retained per agent result through step metadata." },
        warnings: generationWarnings,
        approvalRequired: false,
        reviewReferences: completedGenerationResults.flatMap((result) => result.reviewReferences ?? []),
        resultMetadata: { generationRequestCount: generationRequests.length, generatedAssetCount: completedGenerationResults.length },
      };
      steps.push(generationStep);
      confidence.generator = generationStep.confidence;
      warnings.push(...generationWarnings);
      agentReasoning.push({ agentName: generationStep.agentName, reasoning: generationStep.reasoning });
      outputs.generation = {
        requests: generationRequests,
        attempts: completedGenerationResults.map((result) => result.data.attempt),
        promptArtifacts: completedGenerationResults.map((result) => result.data.promptArtifact),
        assets: completedGenerationResults.map((result) => result.data.asset),
      };

      if (this.agents.critic && outputs.generation.assets.length) {
        const evaluationResults = await Promise.all(outputs.generation.assets.flatMap(async (asset) => {
          const shot = shotPlanResult.data.shots.find((candidate) => candidate.id === asset.shotId);
          if (!shot) return [];
          const decisions = decisionsResult.data.filter((decision) => shot.artDirectionDecisionIds.includes(decision.id));
          const result = await this.agents.critic?.agent.critique({ subjectId: context.subject.id, shot, generatedAssets: [asset], decisions, researchReport: researchResult.data, evaluationCriteria: context.generation?.evaluationCriteria }, context.agentContext);
          return result ? [result] : [];
        }));
        const completedEvaluationResults = evaluationResults.flat();
        const evaluationStep: PipelineStep = {
          agentName: this.agents.critic.name,
          inputSummary: `${outputs.generation.assets.length} generated asset(s) linked to planned shots.`,
          outputSummary: `${completedEvaluationResults.flatMap((result) => result.data).length} evaluation result(s).`,
          reasoning: {
            explanation: "Collected structured evaluations after generation.",
            assumptions: completedEvaluationResults.flatMap((result) => result.reasoning.assumptions),
            uncertainties: completedEvaluationResults.flatMap((result) => result.reasoning.uncertainties),
            evidenceIds: completedEvaluationResults.flatMap((result) => result.reasoning.evidenceIds),
          },
          confidence: { level: "aggregated", rationale: "Evaluation confidence is retained per agent result through step metadata." },
          warnings: completedEvaluationResults.flatMap((result) => result.warnings),
          approvalRequired: false,
          reviewReferences: completedEvaluationResults.flatMap((result) => result.reviewReferences ?? []),
          resultMetadata: { evaluatedAssetCount: outputs.generation.assets.length, evaluationCount: completedEvaluationResults.flatMap((result) => result.data).length },
        };
        steps.push(evaluationStep);
        confidence.critic = evaluationStep.confidence;
        warnings.push(...evaluationStep.warnings);
        agentReasoning.push({ agentName: evaluationStep.agentName, reasoning: evaluationStep.reasoning });
        outputs.evaluations = completedEvaluationResults.flatMap((result) => result.data);
      }
    }

    return {
      executionId: context.execution.id,
      subjectId: context.subject.id,
      status: "completed",
      steps,
      outputs,
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
