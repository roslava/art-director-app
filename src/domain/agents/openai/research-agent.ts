import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResearchAgent, ResearchRequest } from "@/domain/agents/research-agent";
import type { AgentContext, AgentResult } from "@/domain/agents/types";
import type { ResearchProvider } from "@/domain/providers/research-provider";
import { researchReportSchema, type ResearchReport } from "@/domain/research";

const model = "gpt-5.5";

export class ResearchReportValidationError extends Error {
  readonly code = "RESEARCH_REPORT_VALIDATION_FAILED";

  constructor(message: string, readonly issues: string[]) {
    super(message);
    this.name = "ResearchReportValidationError";
  }
}

const validationIssues = (error: unknown): string[] => error instanceof Error ? [error.message] : ["The model returned an invalid research report."];

/** Converts raw provider material into the existing, validated ResearchReport domain model. */
export class OpenAIResearchAgent implements ResearchAgent {
  private readonly client: OpenAI;

  constructor(private readonly researchProvider: ResearchProvider, client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required to run real OpenAI research. Add it to .env.local before running the demo.");
    }
    this.client = client;
  }

  async research(request: ResearchRequest, context: AgentContext): Promise<AgentResult<ResearchReport>> {
    const providerResult = await this.researchProvider.research({
      subject: request.subject,
      instructions: request.scope,
      context: { requestId: context.requestId, metadata: context.metadata },
    });
    const allowedSourceIds = new Set(providerResult.references.map((reference) => reference.id));
    const sources = providerResult.references.map((reference) => ({
      id: reference.id,
      title: reference.title,
      type: "web",
      url: reference.url,
      citation: reference.citation ?? reference.title,
      reliability: "Web-search source; assess per claim.",
    }));

    try {
      const response = await this.client.responses.parse({
        model,
        instructions: "You are a research agent for visual art direction. Transform only the supplied raw research and listed sources into a concise report. Do not add facts, sources, or URLs. A claim must cite one or more listed source IDs; omit claims that cannot be grounded. Preserve uncertainty and disagreement in a claim confidence rationale or report summary. Include only properties relevant to this subject; do not force mineral-specific fields on other subjects. Opportunities and risks must be visual-production observations, not image-generation prompts. Use the exact subjectId supplied.",
        input: `Subject ID: ${request.subject.id}\nSubject: ${request.subject.name}\nDescription: ${request.subject.description}\n\nSources (only these IDs may be cited):\n${JSON.stringify(sources)}\n\nRaw provider research:\n${providerResult.rawResearch.join("\n\n")}`,
        text: { format: zodTextFormat(researchReportSchema, "research_report") },
      });
      const parsed = response.output_parsed;
      const result = researchReportSchema.safeParse(parsed);
      if (!result.success) throw result.error;
      if (result.data.subjectId !== request.subject.id) {
        throw new ResearchReportValidationError("Research report subjectId does not match the request.", ["subjectId mismatch"]);
      }
      const unknownSourceIds = result.data.claims.flatMap((claim) => claim.sourceIds).filter((id) => !allowedSourceIds.has(id));
      if (unknownSourceIds.length) {
        throw new ResearchReportValidationError("Research report cites source IDs that were not provided by the provider.", [...new Set(unknownSourceIds)]);
      }

      return {
        data: result.data,
        reasoning: { explanation: "Converted cited raw provider research into a validated ResearchReport.", assumptions: ["Web-search references are preserved as source records, not independently verified by this agent."], uncertainties: result.data.claims.filter((claim) => claim.confidence.level !== "high").map((claim) => claim.statement), evidenceIds: result.data.sources.map((source) => source.id) },
        confidence: result.data.overallConfidence,
        warnings: result.data.sources.length ? [] : ["No web references were returned; report claims should remain empty or explicitly uncertain."],
        metadata: { implementation: "openai", requestId: context.requestId ?? "not-provided", claimCount: result.data.claims.length, sourceCount: result.data.sources.length, providerReferenceCount: providerResult.references.length },
      };
    } catch (error) {
      if (error instanceof ResearchReportValidationError) throw error;
      throw new ResearchReportValidationError("OpenAI output could not be validated as a ResearchReport.", validationIssues(error));
    }
  }
}
